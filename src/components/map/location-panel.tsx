"use client";

import { ArrowUpRight, Orbit } from "@/components/ui/icons";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { SkyLocation, Tour } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { formatCoord, pick } from "@/lib/l10n";
import { aqiLevel, brightnessRatio, darkWindow, moonInfo, tonightScore, type SkyConditions } from "@/lib/sky";
import { SkyPlate } from "../ui/sky-plate";

const Panorama = dynamic(() => import("./panorama").then((m) => m.Panorama), { ssr: false });

const AQI_COLOR = { good: "#4ade80", moderate: "#facc15", sensitive: "#fb923c", unhealthy: "#f87171", unknown: "var(--ink-faint)" };

function MoonGlyph({ phaseDeg, size = 44 }: { phaseDeg: number; size?: number }) {
  // Terminator as an ellipse whose x-radius follows cos(phase).
  const r = size / 2;
  const k = Math.cos((phaseDeg * Math.PI) / 180);
  const waxing = phaseDeg < 180;
  const rx = Math.abs(k) * r;
  const lit = `M ${r} 0 A ${r} ${r} 0 0 ${waxing ? 1 : 0} ${r} ${size} A ${rx} ${r} 0 0 ${(k > 0) === waxing ? 0 : 1} ${r} 0 Z`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={r} cy={r} r={r - 0.5} fill="var(--bg-elev)" stroke="var(--line-strong)" />
      <path d={lit} fill="var(--ink)" opacity={0.9} />
    </svg>
  );
}

function SqmDial({ sqm }: { sqm: number }) {
  // 18 (city) → 22 (pristine) mapped onto a 240° arc.
  const p = Math.max(0, Math.min(1, (sqm - 18) / 4));
  const a0 = -210;
  const a = a0 + p * 240;
  const pt = (deg: number, r: number) => [60 + r * Math.cos((deg * Math.PI) / 180), 60 + r * Math.sin((deg * Math.PI) / 180)];
  const arc = (from: number, to: number, r: number) => {
    const [x1, y1] = pt(from, r);
    const [x2, y2] = pt(to, r);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };
  return (
    <svg viewBox="0 0 120 100" className="w-full max-w-[220px]" aria-hidden>
      <path d={arc(a0, 30, 48)} stroke="var(--line-strong)" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d={arc(a0, a, 48)} stroke="var(--accent)" strokeWidth="6" fill="none" strokeLinecap="round" />
      {Array.from({ length: 9 }, (_, i) => {
        const d = a0 + (i / 8) * 240;
        const [x1, y1] = pt(d, 38);
        const [x2, y2] = pt(d, 41);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink-faint)" strokeWidth="1" />;
      })}
      <text x="60" y="62" textAnchor="middle" className="readout" fill="var(--ink)" fontSize="20">
        {sqm.toFixed(2)}
      </text>
      <text x="60" y="76" textAnchor="middle" fill="var(--ink-faint)" fontSize="7" letterSpacing="1.5">
        MAG/ARCSEC²
      </text>
    </svg>
  );
}

const time = (d: Date | null, locale: string) =>
  d ? d.toLocaleTimeString(locale === "en" ? "en-GB" : "vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }) : "—";

export function LocationPanel({ location: l, tours, sky, loading }: { location: SkyLocation; tours: Tour[]; sky?: SkyConditions; loading: boolean }) {
  const t = useTranslations("map");
  const tt = useTranslations("tours");
  const locale = useLocale();
  const [pano, setPano] = useState(false);
  const moon = useMemo(() => moonInfo(), []);
  const dark = useMemo(() => darkWindow(l.lat, l.lng, l.elevationM), [l]);
  const related = tours.filter((x) => x.locationSlug === l.slug);
  const score = tonightScore(l.sqm, sky?.clouds ?? null, moon);
  const level = aqiLevel(sky?.aqi ?? null);
  const months = locale === "en" ? "JFMAMJJASOND" : "123456789⁰¹²";

  return (
    <div>
      <SkyPlate image={l.image} seed={l.slug} className="aspect-[16/8] rounded-t-[1.2rem]" sizes="400px" />
      <div className="space-y-6 p-5">
        <div>
          <p className="readout text-[11px] text-ink-faint">
            {formatCoord(l.lat, l.lng)} · {l.elevationM.toLocaleString(locale)} m
          </p>
          <h2 className="display mt-2 text-3xl">{pick(l.name, locale)}</h2>
          <p className="text-sm text-ink-muted">{pick(l.province, locale)}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{pick(l.summary, locale)}</p>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border hairline p-4">
          <SqmDial sqm={l.sqm} />
          <dl className="readout space-y-3 text-right text-xs">
            <div>
              <dt className="text-ink-faint">{t("bortle")}</dt>
              <dd className="text-2xl text-ink">{l.bortle}</dd>
            </div>
            <div>
              <dt className="text-ink-faint">× natural</dt>
              <dd className="text-lg text-ink">{brightnessRatio(l.sqm).toFixed(2)}</dd>
            </div>
          </dl>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border hairline p-3">
            <p className="eyebrow !text-[10px]">Score</p>
            <p className={cn("readout mt-1 text-2xl", loading ? "animate-pulse text-ink-faint" : "text-accent")}>{score}</p>
          </div>
          <div className="rounded-xl border hairline p-3">
            <p className="eyebrow !text-[10px]">{t("aqi")}</p>
            <p className="readout mt-1 flex items-center gap-2 text-2xl">
              <span className="size-2 rounded-full" style={{ background: AQI_COLOR[level] }} />
              {sky?.aqi ?? "—"}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border hairline p-3">
            <MoonGlyph phaseDeg={moon.phaseDeg} size={30} />
            <div>
              <p className="eyebrow !text-[10px]">{t("moon")}</p>
              <p className="readout text-sm">{Math.round(moon.illumination * 100)}%</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <p className="eyebrow">{t("clouds")}</p>
            <p className="readout text-xs text-ink-muted">{sky?.clouds != null ? `${sky.clouds}%` : loading ? t("loading") : t("unavailable")}</p>
          </div>
          <div className="mt-3 flex h-16 items-end gap-1">
            {(sky?.cloudHourly ?? Array.from({ length: 10 }, (_, i) => ({ time: String(i), value: 0 }))).map((h) => (
              <div key={h.time} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-sm bg-ink/70" style={{ height: `${Math.max(4, h.value)}%`, opacity: loading ? 0.2 : 0.35 + h.value / 160 }} title={`${h.time.slice(11, 16)} · ${h.value}%`} />
                <span className="readout text-[9px] text-ink-faint">{h.time.slice(11, 13)}</span>
              </div>
            ))}
          </div>
          <p className="readout mt-3 text-xs text-ink-muted">
            ☾ {time(dark.moonrise, locale)} → {time(dark.moonset, locale)} · {t("bestMonths")}: {time(dark.start, locale)}–{time(dark.end, locale)}
          </p>
        </div>

        <div>
          <p className="eyebrow">{t("bestMonths")}</p>
          <div className="readout mt-2 grid grid-cols-12 gap-1 text-center text-[10px]">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className={cn("rounded py-1.5", l.bestMonths.includes(i + 1) ? "bg-accent text-accent-ink" : "bg-bg-elev text-ink-faint")}>
                {locale === "en" ? months[i] : i + 1}
              </span>
            ))}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-ink-faint">{t("estimateNote")}</p>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPano(true)} className="btn btn-ghost !py-2.5 text-sm">
            <Orbit size={15} /> {t("openPanorama")}
          </button>
          {related.map((tour) => (
            <Link key={tour.slug} href={`/tours/${tour.slug}`} className="btn btn-primary !py-2.5 text-sm">
              {tour.code} · {tt("book")} <ArrowUpRight size={15} />
            </Link>
          ))}
        </div>
      </div>
      {pano && <Panorama location={l} onClose={() => setPano(false)} />}
    </div>
  );
}
