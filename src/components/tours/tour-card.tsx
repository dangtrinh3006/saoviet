"use client";

import { ArrowUpRight } from "@/components/ui/icons";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { locationBySlug } from "@/content/locations";
import type { Tour } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { formatVnd, pick } from "@/lib/l10n";
import { SkyPlate } from "../ui/sky-plate";

export function TourCard({ tour, index = 0 }: { tour: Tour; index?: number }) {
  const locale = useLocale();
  const t = useTranslations("tours");
  const loc = locationBySlug(tour.locationSlug);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 200, damping: 20 });
  const glare = useTransform([mx, my], ([x, y]) => `radial-gradient(400px circle at ${Number(x) * 100}% ${Number(y) * 100}%, var(--glow), transparent 60%)`);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group card relative h-full overflow-hidden"
      >
        <Link href={`/tours/${tour.slug}`} className="flex h-full flex-col">
          <div className="relative">
            <SkyPlate credit={false} image={tour.image} seed={tour.slug} className="aspect-[4/3]" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
            <span className="readout absolute left-4 top-4 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur">
              {tour.code}
            </span>
            {loc && (
              <span className="readout absolute right-4 top-4 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur">
                SQM {loc.sqm.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-3 p-5 md:p-6" style={{ transform: "translateZ(30px)" }}>
            <p className="eyebrow">
              {loc ? pick(loc.province, locale) : ""} · {t("nights", { count: tour.nights })}
            </p>
            <h3 className="display text-2xl md:text-[1.7rem]">{pick(tour.title, locale)}</h3>
            <p className="line-clamp-2 text-sm text-ink-muted">{pick(tour.tagline, locale)}</p>
            <div className="mt-auto flex items-end justify-between pt-2">
              <p className="text-sm text-ink-muted">
                {t("from")}{" "}
                <span className="readout text-lg text-ink">{formatVnd(tour.priceVnd, locale)}</span>
              </p>
              <span className="grid size-10 place-items-center rounded-full ring-1 ring-line transition group-hover:bg-accent group-hover:text-accent-ink">
                <ArrowUpRight size={18} />
              </span>
            </div>
          </div>
        </Link>
        <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: glare }} />
      </motion.div>
    </motion.article>
  );
}
