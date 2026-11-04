"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { locationBySlug } from "@/content/locations";
import type { Region, Tour } from "@/content/types";
import { cn } from "@/lib/cn";
import { TourCard } from "./tour-card";

const REGIONS: (Region | "all")[] = ["all", "north", "central", "highlands", "south", "islands"];
const REGION_LABEL: Record<Region | "all", { vi: string; en: string }> = {
  all: { vi: "Tất cả", en: "All" },
  north: { vi: "Miền Bắc", en: "North" },
  central: { vi: "Miền Trung", en: "Central" },
  highlands: { vi: "Tây Nguyên", en: "Highlands" },
  south: { vi: "Miền Nam", en: "South" },
  islands: { vi: "Biển đảo", en: "Islands" },
};

export function TourBrowser({ tours, ratings }: { tours: Tour[]; ratings: Record<string, { average: number; total: number }> }) {
  const t = useTranslations("tours");
  const locale = useLocale() as "vi" | "en";
  const [region, setRegion] = useState<Region | "all">("all");
  const [sort, setSort] = useState<"dark" | "price" | "nights">("dark");

  const list = useMemo(() => {
    const rows = tours
      .map((tour) => ({ tour, loc: locationBySlug(tour.locationSlug) }))
      .filter(({ loc }) => region === "all" || loc?.region === region);
    rows.sort((a, b) =>
      sort === "price" ? a.tour.priceVnd - b.tour.priceVnd : sort === "nights" ? a.tour.nights - b.tour.nights : (b.loc?.sqm ?? 0) - (a.loc?.sqm ?? 0),
    );
    return rows.map((r) => r.tour);
  }, [tours, region, sort]);

  return (
    <>
      <div className="sticky top-16 z-20 -mx-5 mb-10 flex flex-col gap-3 border-y hairline bg-bg/80 px-5 py-3 backdrop-blur-xl md:top-20 md:-mx-8 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:pb-0">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              aria-pressed={region === r}
              className={cn("shrink-0 rounded-full px-4 py-2 text-sm transition-colors", region === r ? "bg-ink text-bg" : "text-ink-muted ring-1 ring-line hover:text-ink")}
            >
              {REGION_LABEL[r][locale]}
            </button>
          ))}
        </div>
        <div className="readout flex items-center gap-2 text-xs">
          {(["dark", "price", "nights"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setSort(s)} className={cn("rounded-full px-3 py-1.5 uppercase tracking-wider", sort === s ? "text-accent ring-1 ring-accent" : "text-ink-muted")}>
              {s === "dark" ? "SQM" : s === "price" ? "₫" : t("nights", { count: 2 }).replace(/\d+\s*/, "")}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((tour, i) => (
          <div key={tour.slug} className="relative">
            <TourCard tour={tour} index={i} />
            {ratings[tour.slug] && (
              <span className="readout pointer-events-none absolute bottom-[7.2rem] left-5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white backdrop-blur">
                ★ {ratings[tour.slug].average.toFixed(1)} · {ratings[tour.slug].total}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
