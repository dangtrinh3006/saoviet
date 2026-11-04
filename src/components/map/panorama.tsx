"use client";

import "@photo-sphere-viewer/core/index.css";
import { Viewer } from "@photo-sphere-viewer/core";
import { X } from "@/components/ui/icons";
import { useLocale } from "next-intl";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { SkyLocation } from "@/content/types";
import { pick } from "@/lib/l10n";

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

export function Panorama({ location, onClose }: { location: SkyLocation; onClose: () => void }) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const seed = [...location.slug].reduce((a, ch) => a + ch.charCodeAt(0), 7);
    const viewer = new Viewer({
      container: ref.current,
      panorama: location.panorama?.src ?? proceduralSky(seed),
      caption: location.panorama ? `${location.panorama.credit} · ${location.panorama.license}` : pick(location.name, locale),
      defaultPitch: 0.35,
      defaultZoomLvl: 20,
      navbar: ["zoom", "move", "caption", "fullscreen"],
      mousewheelCtrlKey: false,
      touchmoveTwoFingers: false,
    });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let dragging = false;
    const el = ref.current;
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
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", esc);
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      viewer.destroy();
    };
  }, [location, locale, onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black" role="dialog" aria-modal="true" aria-label={pick(location.name, locale)}>
      <div ref={ref} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-5 top-5 z-10 text-white md:left-8 md:top-8">
        <p className="readout text-xs text-white/60">360° · {location.lat.toFixed(2)}°N {location.lng.toFixed(2)}°E</p>
        <h2 className="display mt-2 text-4xl md:text-5xl">{pick(location.name, locale)}</h2>
      </div>
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-5 top-5 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur md:right-8 md:top-8">
        <X size={20} />
      </button>
    </div>,
    document.body,
  );
}
