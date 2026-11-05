import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { PublishChip } from "@/components/admin/catalog/publish-chip";
import { TourRowActions } from "@/components/admin/catalog/tour-row-actions";
import { Plus, Search, Star } from "@/components/ui/icons";
import { locationBySlug } from "@/content/locations";
import { Link } from "@/i18n/navigation";
import { getFreshSession } from "@/lib/auth";
import { TOUR_STATUSES, type TourStatus } from "@/lib/catalog-schema";
import { formatVnd, pick } from "@/lib/l10n";
import { listAllTours } from "@/server/admin-catalog";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();

export default async function AdminToursPage({ params, searchParams }: PageProps<"/[locale]/admin/tours">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getFreshSession();
  if (session?.user.role !== "admin") notFound();

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const status = TOUR_STATUSES.includes(sp.status as TourStatus) ? (sp.status as TourStatus) : null;
  const t = await getTranslations("admincatalog");
  const format = await getFormatter();

  const all = await listAllTours();
  const needle = fold(q);
  const rows = all.filter(
    (r) =>
      (!status || r.status === status) &&
      (!needle || [r.code, r.slug, r.title.vi, r.title.en, r.locationSlug].some((f) => fold(f).includes(needle))),
  );
  const counts = Object.fromEntries(TOUR_STATUSES.map((s) => [s, all.filter((r) => r.status === s).length]));

  return (
    <div className="pb-6">
      <p className="readout text-xs text-ink-faint">
        <Link href="/admin" className="hover:text-ink">
          CONTROL ROOM
        </Link>{" "}
        · {t("eyebrow")}
      </p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="display text-[clamp(2.4rem,6vw,4.25rem)]">{t("title")}</h1>
          <p className="mt-3 max-w-2xl text-sm text-ink-muted">{t("subtitle")}</p>
        </div>
        <Link href="/admin/tours/new" className="btn btn-primary">
          <Plus size={16} /> {t("actions.new")}
        </Link>
      </div>

      <dl className="readout mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border hairline bg-line text-sm">
        {TOUR_STATUSES.map((s) => (
          <div key={s} className="bg-bg px-4 py-3 md:px-6 md:py-4">
            <dt className="eyebrow">{t(`status.${s}`)}</dt>
            <dd className="mt-1 text-xl md:text-2xl">{counts[s]}</dd>
          </div>
        ))}
      </dl>

      {/* Plain GET form: filters live in the URL and work without JavaScript. */}
      <form method="get" role="search" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="tour-q" className="eyebrow mb-1.5 block">
            {t("filters.search")}
          </label>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input id="tour-q" name="q" type="search" defaultValue={q} placeholder={t("filters.searchPlaceholder")} className="field !py-2.5 !pl-9 text-sm" />
          </div>
        </div>
        <div className="sm:w-48">
          <label htmlFor="tour-status" className="eyebrow mb-1.5 block">
            {t("filters.status")}
          </label>
          <select id="tour-status" name="status" defaultValue={status ?? ""} className="field !py-2.5 text-sm">
            <option value="">{t("filters.all")}</option>
            {TOUR_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-ghost !py-2.5 text-sm">
            {t("filters.apply")}
          </button>
          {(q || status) && (
            <Link href="/admin/tours" className="btn !py-2.5 text-sm text-ink-muted hover:text-ink">
              {t("filters.clear")}
            </Link>
          )}
        </div>
      </form>

      <p className="readout mt-6 text-xs text-ink-faint" aria-live="polite">
        {t("filters.count", { count: rows.length, total: all.length })}
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 text-ink-faint">{t("empty")}</p>
      ) : (
        <>
          <div className="mt-3 hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead className="eyebrow">
                <tr className="border-b hairline">
                  <th className="py-3 pr-4 font-normal">{t("cols.code")}</th>
                  <th className="py-3 pr-4 font-normal">{t("cols.title")}</th>
                  <th className="py-3 pr-4 font-normal">{t("cols.location")}</th>
                  <th className="whitespace-nowrap py-3 pr-4 text-right font-normal">{t("cols.price")}</th>
                  <th className="whitespace-nowrap py-3 pr-4 text-right font-normal">{t("cols.nights")}</th>
                  <th className="py-3 pr-4 font-normal">{t("cols.status")}</th>
                  <th className="hidden py-3 pr-4 font-normal xl:table-cell">{t("cols.updated")}</th>
                  <th className="py-3 text-right font-normal">
                    <span className="sr-only">{t("cols.actions")}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => {
                  const loc = locationBySlug(r.locationSlug);
                  const title = pick(r.title, locale);
                  return (
                    <tr key={r.slug} className={r.status === "archived" ? "align-top opacity-60" : "align-top"} data-tour={r.slug}>
                      <td className="readout whitespace-nowrap py-4 pr-4">{r.code}</td>
                      <td className="max-w-[16rem] py-4 pr-4">
                        <span className="flex items-center gap-1.5 font-medium">
                          {r.featured && <Star size={13} className="shrink-0 fill-accent text-accent" />}
                          {r.featured && <span className="sr-only">{t("cols.featured")}</span>}
                          <span className="truncate">{title}</span>
                        </span>
                        <span className="readout block truncate text-xs text-ink-faint">/{r.slug}</span>
                      </td>
                      <td className="py-4 pr-4">
                        {loc ? pick(loc.name, locale) : r.locationSlug}
                        {loc && <span className="readout block text-xs text-ink-faint">SQM {loc.sqm.toFixed(2)}</span>}
                      </td>
                      <td className="readout whitespace-nowrap py-4 pr-4 text-right">{formatVnd(r.priceVnd, locale)}</td>
                      <td className="readout py-4 pr-4 text-right">{r.nights}</td>
                      <td className="whitespace-nowrap py-4 pr-4">
                        <PublishChip status={r.status} label={t(`status.${r.status}`)} />
                      </td>
                      <td className="readout hidden py-4 pr-4 text-xs text-ink-muted xl:table-cell">
                        <time dateTime={r.updatedAt.toISOString()}>{format.dateTime(r.updatedAt, { dateStyle: "short", timeStyle: "short" })}</time>
                      </td>
                      <td className="py-4">
                        <TourRowActions compact slug={r.slug} status={r.status} title={title} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="mt-3 space-y-3 lg:hidden">
            {rows.map((r) => {
              const loc = locationBySlug(r.locationSlug);
              const title = pick(r.title, locale);
              return (
                <li key={r.slug} className={r.status === "archived" ? "card space-y-3 p-4 opacity-70" : "card space-y-3 p-4"} data-tour={r.slug}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="readout text-sm">
                      {r.code}
                      {r.featured && <Star size={12} className="ml-1.5 inline fill-accent text-accent" />}
                    </span>
                    <PublishChip status={r.status} label={t(`status.${r.status}`)} />
                  </div>
                  <p className="display break-words text-xl">{title}</p>
                  <p className="readout flex flex-wrap justify-between gap-x-3 text-xs text-ink-muted">
                    <span>
                      {loc ? pick(loc.name, locale) : r.locationSlug} · {r.nights}N
                    </span>
                    <span className="text-ink">{formatVnd(r.priceVnd, locale)}</span>
                  </p>
                  <p className="readout text-[11px] text-ink-faint">
                    {t("cols.updated")}: {format.dateTime(r.updatedAt, { dateStyle: "short", timeStyle: "short" })}
                  </p>
                  <TourRowActions slug={r.slug} status={r.status} title={title} />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
