"use client";

import { Cloud, Wind } from "@/components/ui/icons";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { locations } from "@/content/locations";
import { Link } from "@/i18n/navigation";
import { useSky } from "@/lib/use-sky";
import { pick } from "@/lib/l10n";
import { moonInfo, tonightScore } from "@/lib/sky";

export function Tonight() {
  const t = useTranslations("map");
  const locale = useLocale();
  const { data, loading } = useSky();
  const moon = useMemo(() => moonInfo(), []);

  const ranked = useMemo(
    () =>
      locations
        .map((l) => ({ l, c: data?.[l.slug], score: tonightScore(l.sqm, data?.[l.slug]?.clouds ?? null, moon) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    [data, moon],
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ranked.map(({ l, c, score }, i) => (
        <Link key={l.slug} href={`/map?l=${l.slug}`} className="card group relative block overflow-hidden p-6">
          <div className="flex items-start justify-between">
            <span className="readout text-xs text-ink-faint">#{i + 1}</span>
            <span className="readout text-xs text-ink-muted">{l.lat.toFixed(2)}°N</span>
          </div>
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <h3 className="display text-3xl">{pick(l.name, locale)}</h3>
              <p className="mt-1 text-sm text-ink-muted">{pick(l.province, locale)}</p>
            </div>
            <div className="text-right">
              <p className={`readout text-5xl leading-none ${loading ? "animate-pulse text-ink-faint" : "text-accent"}`}>{score}</p>
              <p className="eyebrow mt-1">/100</p>
            </div>
          </div>
          <div className="mt-6 h-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-accent transition-[width] duration-1000" style={{ width: `${score}%` }} />
          </div>
          <dl className="readout mt-5 grid grid-cols-3 gap-2 text-xs">
            <div>
              <dt className="text-ink-faint">SQM</dt>
              <dd>{l.sqm.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-ink-faint">
                <Cloud size={11} /> {t("clouds")}
              </dt>
              <dd>{c?.clouds != null ? `${c.clouds}%` : "—"}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-ink-faint">
                <Wind size={11} /> AQI
              </dt>
              <dd>{c?.aqi ?? "—"}</dd>
            </div>
          </dl>
        </Link>
      ))}
    </div>
  );
}
