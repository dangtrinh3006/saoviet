"use client";

import { ArrowRight } from "@/components/ui/icons";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { locations } from "@/content/locations";
import { Link } from "@/i18n/navigation";
import { moonInfo } from "@/lib/sky";
import { HeroVideo } from "./hero-video";
import { useMounted } from "@/lib/use-client";

// WebGL never renders on the server; the poster gradient below is the LCP instead.
const Starfield = dynamic(() => import("../three/starfield").then((m) => m.Starfield), { ssr: false });
const VietnamGlobe = dynamic(() => import("../three/vietnam-globe").then((m) => m.VietnamGlobe), { ssr: false });

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("home");
  const tm = useTranslations("map");
  const locale = useLocale();
  const mounted = useMounted();
  const moon = useMemo(() => (mounted ? moonInfo() : null), [mounted]);

  const points = locations.map((l) => ({ lat: l.lat, lng: l.lng, weight: (22 - l.sqm) < 0.4 ? 1 : 0 }));
  const words = t("heroTitle").split(" ");

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden pt-24 md:pt-28">
      <div
        className="absolute inset-0 -z-20"
        style={{ background: "radial-gradient(120% 80% at 70% 20%, color-mix(in oklab, var(--aurora) 14%, transparent), transparent 60%), radial-gradient(90% 60% at 10% 90%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 60%)" }}
      />
      <HeroVideo />
      <Starfield className="absolute inset-0 -z-10 opacity-70" />
      <div className="chart-grid absolute inset-0 -z-10 opacity-60" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative z-10 pt-6 md:pt-14">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="eyebrow flex items-center gap-3"
          >
            <span className="inline-block h-px w-10 bg-accent" />
            {t("heroEyebrow")}
          </motion.p>

          <h1 className="display mt-6 text-[clamp(2.6rem,7.4vw,6.4rem)]">
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                <motion.span
                  className={`inline-block ${i === words.length - 1 ? "text-gradient" : ""}`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, delay: 0.25 + i * 0.07, ease }}
                >
                  {w}&nbsp;
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease }}
            className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg"
          >
            {t("heroSubtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.95, ease }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link href="/tours" className="btn btn-primary">
              {t("ctaTours")} <ArrowRight size={16} />
            </Link>
            <Link href="/map" className="btn btn-ghost">
              {t("ctaMap")}
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.4, ease }}
          className="relative mx-auto w-full max-w-[min(560px,88vw)]"
        >
          <div className="absolute inset-[8%] rounded-full" style={{ boxShadow: "0 0 120px 10px var(--glow)" }} />
          <VietnamGlobe points={points} />
          <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full text-ink" aria-hidden>
            <circle cx="50" cy="50" r="49.5" fill="none" stroke="currentColor" strokeOpacity=".14" strokeWidth=".15" />
            {Array.from({ length: 72 }, (_, i) => {
              const a = (i / 72) * Math.PI * 2;
              const r1 = i % 6 === 0 ? 47.4 : 48.5;
              // Rounded so server and client serialise identical attribute strings.
              const f = (v: number) => Math.round(v * 1000) / 1000;
              return (
                <line key={i} x1={f(50 + Math.cos(a) * r1)} y1={f(50 + Math.sin(a) * r1)} x2={f(50 + Math.cos(a) * 49.5)} y2={f(50 + Math.sin(a) * 49.5)} stroke="currentColor" strokeOpacity=".3" strokeWidth=".15" />
              );
            })}
          </svg>
        </motion.div>
      </div>

      <motion.dl
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="readout mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-px overflow-hidden border-y hairline px-5 text-xs md:mt-16 md:grid-cols-4 md:px-8"
      >
        {[
          [t("statsLocations"), String(locations.length).padStart(2, "0")],
          [t("statsDarkest"), `${Math.max(...locations.map((l) => l.sqm)).toFixed(2)} mag/″²`],
          [tm("moon"), moon ? `${Math.round(moon.illumination * 100)}%` : "—"],
          ["UTC+7", new Date().toLocaleDateString(locale === "en" ? "en-GB" : "vi-VN")],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1.5 py-4 pr-4">
            <dt className="truncate text-[10px] uppercase tracking-[0.16em] text-ink-faint">{k}</dt>
            <dd className="text-base text-ink md:text-lg" suppressHydrationWarning>
              {v}
            </dd>
          </div>
        ))}
      </motion.dl>
    </section>
  );
}
