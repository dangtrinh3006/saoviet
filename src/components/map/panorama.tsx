"use client";

import "@photo-sphere-viewer/core/index.css";
import { Viewer } from "@photo-sphere-viewer/core";
import { Loader2, X } from "@/components/ui/icons";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { SkyLocation } from "@/content/types";
import { cn } from "@/lib/cn";
import { pick } from "@/lib/l10n";
import { streetViewEmbedUrl, type PanoSource, type PanoramaApiResponse, type StreetPano } from "@/lib/panorama-sources";

// Inlined at build time; Street View is offered only when the owner configured a key.
const EMBED_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
const ORDER: PanoSource[] = ["streetview", "mapillary", "commons", "sky"];

/** Procedural equirectangular night sky (2:1) with a Milky Way band and a ridge horizon. */
function proceduralSky(seed: number) {
  const w = 4096;
  const h = 2048;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#02040b");
  sky.addColorStop(0.45, "#0a1430");
  sky.addColorStop(0.5, "#1b2547");
  sky.addColorStop(0.52, "#05070d");
  sky.addColorStop(1, "#020305");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  // Milky Way: a sinusoid across the equirectangular frame, built from soft dust blobs.
  for (let i = 0; i < 2600; i++) {
    const x = r() * w;
    const y = h * 0.26 + Math.sin((x / w) * Math.PI * 2 + 1.2) * h * 0.16 + (r() - 0.5) * h * 0.09;
    const rad = 8 + r() * 60;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    const warm = r() < 0.3;
    grd.addColorStop(0, warm ? "rgba(255,214,170,0.05)" : "rgba(170,190,255,0.05)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < 14000; i++) {
    const y = Math.pow(r(), 1.2) * h * 0.5;
    const size = Math.pow(r(), 9) * 2.6 + 0.35;
    g.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.65})`;
    g.beginPath();
    g.arc(r() * w, y, size, 0, Math.PI * 2);
    g.fill();
  }
  // Mountain silhouette sitting on the horizon line.
  g.fillStyle = "#010204";
  g.beginPath();
  g.moveTo(0, h);
  for (let x = 0; x <= w; x += 32) {
    const y = h * 0.5 - (Math.sin(x / 210 + seed) * 0.5 + Math.sin(x / 67) * 0.2 + r() * 0.08 + 0.4) * h * 0.06;
    g.lineTo(x, y);
  }
  g.lineTo(w, h);
  g.fill();
  return c.toDataURL("image/jpeg", 0.9);
}

/** Photo Sphere Viewer for any equirectangular image; reports load failures so the caller can fall back. */
function SphereView({ src, onError }: { src: string; onError: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cleanup = () => {};
    // Deferred so a mount/unmount pair (React StrictMode) never starts a load: three's loader
    // shares in-flight requests per URL, and aborting the first one strands the second viewer.
    const timer = window.setTimeout(() => (cleanup = mountViewer(el, src, () => onErrorRef.current())), 0);
    return () => {
      window.clearTimeout(timer);
      cleanup();
    };
  }, [src]);

  return <div ref={ref} className="absolute inset-0" />;
}

function mountViewer(el: HTMLElement, src: string, onError: () => void) {
  const viewer = new Viewer({
    container: el,
    panorama: src,
    defaultPitch: 0.2,
    defaultZoomLvl: 20,
    navbar: ["zoom", "move", "fullscreen"],
    mousewheelCtrlKey: false,
    touchmoveTwoFingers: false,
  });
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let frame = 0;
  let dragging = false;
  const down = () => (dragging = true);
  const up = () => (dragging = false);
  el.addEventListener("pointerdown", down);
  window.addEventListener("pointerup", up);
  // Slow idle pan, paused while the user drags.
  const spin = () => {
    if (!reduced && !dragging) viewer.rotate({ yaw: viewer.getPosition().yaw + 0.0006, pitch: viewer.getPosition().pitch });
    frame = requestAnimationFrame(spin);
  };
  viewer.addEventListener("ready", spin, { once: true });
  viewer.addEventListener("panorama-error", onError);
  return () => {
    cancelAnimationFrame(frame);
    el.removeEventListener("pointerdown", down);
    window.removeEventListener("pointerup", up);
    viewer.destroy();
  };
}

const ext = (href: string | undefined, label: ReactNode) =>
  href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-white/40 underline-offset-2 hover:text-white">
      {label}
    </a>
  ) : (
    label
  );

type Lookup = { state: "loading" } | { state: "done"; data: PanoramaApiResponse };

export function Panorama({ location, onClose }: { location: SkyLocation; onClose: () => void }) {
  const t = useTranslations("pano");
  const locale = useLocale();
  const name = pick(location.name, locale);
  const [lookup, setLookup] = useState<Lookup>({ state: "loading" });
  const [chosen, setChosen] = useState<PanoSource | null>(null);
  const [failed, setFailed] = useState<PanoSource[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`/api/panorama?lat=${location.lat}&lng=${location.lng}`, { signal: ac.signal })
      .then((r) => (r.ok ? (r.json() as Promise<PanoramaApiResponse>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => setLookup({ state: "done", data }))
      .catch(() => {
        if (!ac.signal.aborted) setLookup({ state: "done", data: { mapillary: null, commons: null } });
      });
    return () => ac.abort();
  }, [location.lat, location.lng]);

  const skyFailed = failed.includes("sky");
  // Client-only module (ssr: false), so the canvas is available during render; built only when needed.
  const proceduralSrc = useMemo(() => {
    if (location.panorama && !skyFailed) return null;
    return proceduralSky([...location.slug].reduce((a, ch) => a + ch.charCodeAt(0), 7));
  }, [location, skyFailed]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const found = lookup.state === "done" ? lookup.data : null;
  const street: Partial<Record<PanoSource, StreetPano>> = {};
  if (found?.mapillary) street.mapillary = found.mapillary;
  if (found?.commons) street.commons = found.commons;
  const available = ORDER.filter((s) => s === "sky" || (!failed.includes(s) && (s === "streetview" ? !!EMBED_KEY : !!street[s])));
  // Until the user picks, show the best source available now (the night sky while the lookup runs).
  const active: PanoSource = chosen && available.includes(chosen) ? chosen : available[0];
  const pano = active === "mapillary" || active === "commons" ? street[active] : undefined;
  const markFailed = (s: PanoSource) => setFailed((f) => (f.includes(s) ? f : [...f, s]));
  // The HDRI can fail too; the procedural sky is the last resort and needs no network.
  const skySrc = location.panorama && !skyFailed ? location.panorama.src : proceduralSrc;

  const intl = locale === "en" ? "en-GB" : "vi-VN";
  const km = (d: number) => new Intl.NumberFormat(intl, { maximumFractionDigits: d < 10 ? 1 : 0 }).format(d);
  const month = (iso: string) => new Date(iso).toLocaleDateString(intl, { year: "numeric", month: "short" });

  let credit: ReactNode;
  if (active === "streetview") {
    credit = (
      <>
        {t("streetviewCredit")} <span className="text-white/50">{t("streetviewNote")}</span>
      </>
    );
  } else if (pano?.source === "mapillary") {
    const link = (c: ReactNode) => ext(pano.pageUrl, c);
    const license = (c: ReactNode) => ext(pano.licenseUrl, c);
    credit = pano.author
      ? t.rich("mapillaryCredit", { author: pano.author, link, license, profile: (c) => ext(pano.authorUrl, c) })
      : t.rich("mapillaryCreditAnon", { link, license });
  } else if (pano?.source === "commons") {
    credit = t.rich("commonsCredit", {
      title: pano.title ?? "",
      author: pano.author,
      licenseName: pano.license,
      file: (c) => ext(pano.pageUrl, c),
      license: (c) => ext(pano.licenseUrl, c),
      link: (c) => ext("https://commons.wikimedia.org/", c),
    });
  } else if (location.panorama && !skyFailed) {
    const p = location.panorama;
    credit = t.rich("skyCredit", { credit: p.credit, license: p.license, link: (c) => ext(p.sourceUrl, c) });
  } else {
    credit = t("skyProcedural");
  }

  let status: string | null = null;
  if (lookup.state === "loading") status = t("searching");
  else if (failed.some((s) => s !== "sky") && active === "sky") status = t("loadFailed");
  else if (!street.mapillary && !street.commons) status = t("noneNearby");

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col bg-black text-white" role="dialog" aria-modal="true" aria-label={t("dialogLabel", { name })}>
      <header className="flex items-start justify-between gap-3 px-4 pb-3 pt-4 md:px-8 md:pt-6">
        <div className="min-w-0">
          <p className="readout text-xs text-white/60">
            360° · {location.lat.toFixed(2)}°N {location.lng.toFixed(2)}°E
          </p>
          <h2 className="display mt-1 truncate text-3xl md:text-5xl">{name}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label={t("close")} className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur">
          <X size={20} />
        </button>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 md:px-8">
        <div role="radiogroup" aria-label={t("sourcesLabel")} className="flex shrink-0 gap-2">
          {available.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={s === active}
              onClick={() => setChosen(s)}
              className={cn(
                "min-h-10 shrink-0 rounded-full border px-3.5 text-sm transition-colors",
                s === active ? "border-white bg-white text-black" : "border-white/25 text-white/80 hover:border-white/60",
              )}
            >
              {t(`source.${s}`)}
            </button>
          ))}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-white/50" aria-live="polite">
          {lookup.state === "loading" && <Loader2 size={14} className="animate-spin" />}
          {status}
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        {active === "streetview" && EMBED_KEY ? (
          <iframe
            title={t("frameTitle", { name })}
            src={streetViewEmbedUrl(EMBED_KEY, location.lat, location.lng, { language: locale })}
            className="absolute inset-0 size-full border-0"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : pano ? (
          <SphereView key={pano.src} src={pano.src} onError={() => markFailed(active)} />
        ) : skySrc ? (
          <SphereView key={skySrc} src={skySrc} onError={() => markFailed("sky")} />
        ) : null}
      </div>

      <footer className="px-4 py-2.5 text-xs leading-relaxed text-white/75 md:px-8">
        {credit}
        {pano && (
          <span className="text-white/50">
            {" · "}
            {t("distance", { km: km(pano.distanceKm) })}
            {pano.capturedAt && ` · ${t("captured", { date: month(pano.capturedAt) })}`}
          </span>
        )}
      </footer>
    </div>,
    document.body,
  );
}

