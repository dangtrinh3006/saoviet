import Form from "next/form";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrderDelete, OrderStatusControl } from "@/components/admin/ops/ops-controls";
import { ArrowDown, Search } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { formatVnd, pick } from "@/lib/l10n";
import { filtersToQuery, ORDER_SORTS, ORDER_STATUSES, parseOrderFilters } from "@/lib/ops-schema";
import { tourLookup } from "@/server/catalog";
import { adminPageSession, searchOrders } from "@/server/ops-queries";

export default async function AdminOrdersPage({ params, searchParams }: PageProps<"/[locale]/admin/orders">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await adminPageSession();
  const filters = parseOrderFilters(await searchParams);
  const [result, catalog, t, ta] = await Promise.all([
    searchOrders(filters),
    tourLookup(),
    getTranslations("adminops"),
    getTranslations("account"),
  ]);
  const query = filtersToQuery(filters, { page: undefined });
  const tours = [...catalog.values()].sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[clamp(2.2rem,5vw,3.75rem)]">{t("orders.title")}</h1>
        <a href={`/api/admin/orders.csv${query}`} className="btn btn-ghost" download>
          <ArrowDown size={16} /> {t("orders.exportCsv")}
        </a>
      </div>

      <Form action={`/${locale}/admin/orders`} className="card mt-8 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-5" role="search">
        <label className="block sm:col-span-2 lg:col-span-3">
          <span className="eyebrow">{t("orders.search")}</span>
          <span className="relative mt-2 block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input name="q" type="search" defaultValue={filters.q ?? ""} placeholder={t("orders.searchPlaceholder")} className="field !pl-9" />
          </span>
        </label>
        <label className="block">
          <span className="eyebrow">{t("common.status")}</span>
          <select name="status" defaultValue={filters.status ?? ""} className="field mt-2">
            <option value="">{t("orders.allStatuses")}</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ta(`status.${s}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">{t("orders.tour")}</span>
          <select name="tour" defaultValue={filters.tour ?? ""} className="field mt-2">
            <option value="">{t("orders.allTours")}</option>
            {tours.map((tour) => (
              <option key={tour.slug} value={tour.slug}>
                {tour.code} · {pick(tour.title, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">{t("orders.sort")}</span>
          <select name="sort" defaultValue={filters.sort} className="field mt-2">
            {ORDER_SORTS.map((s) => (
              <option key={s} value={s}>
                {t(`orders.sorts.${s}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">{t("orders.from")}</span>
          <input name="from" type="date" defaultValue={filters.from ?? ""} className="field mt-2" />
        </label>
        <label className="block">
          <span className="eyebrow">{t("orders.to")}</span>
          <input name="to" type="date" defaultValue={filters.to ?? ""} className="field mt-2" />
        </label>
        <div className="flex items-end gap-3">
          <button type="submit" className="btn btn-primary">
            {t("orders.apply")}
          </button>
          <Link href="/admin/orders" className="btn btn-ghost">
            {t("orders.reset")}
          </Link>
        </div>
      </Form>

      <p className="readout mt-6 text-xs text-ink-muted" data-testid="order-count">
        {t("orders.count", { count: result.total })}
      </p>

      {result.rows.length > 0 && (
        <div className="mt-3">
          {/* One list for every viewport: grid columns from lg up, stacked cards below. */}
          <div className="eyebrow hidden grid-cols-[8rem_minmax(0,1.3fr)_minmax(0,1.3fr)_7rem_8rem_10rem] gap-4 border-b hairline pb-3 lg:grid">
            <span>{t("orders.code")}</span>
            <span>{t("orders.tour")}</span>
            <span>{t("orders.contact")}</span>
            <span>{t("orders.departure")}</span>
            <span className="text-right">{t("orders.total")}</span>
            <span>{t("common.status")}</span>
          </div>
          <ul className="space-y-3 lg:space-y-0 lg:divide-y lg:divide-line">
            {result.rows.map((o) => {
              const tour = catalog.get(o.tourSlug);
              return (
                <li
                  key={o.id}
                  data-code={o.code}
                  className={cn(
                    "card grid gap-3 p-4 lg:grid-cols-[8rem_minmax(0,1.3fr)_minmax(0,1.3fr)_7rem_8rem_10rem] lg:items-start lg:gap-4 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-4 lg:backdrop-blur-none",
                  )}
                >
                  <Link href={`/admin/orders/${o.id}`} className="readout text-sm text-accent hover:underline">
                    {o.code}
                  </Link>
                  <div className="min-w-0">
                    <p className="break-words">{tour ? pick(tour.title, locale) : o.tourSlug}</p>
                    <p className="readout text-xs text-ink-faint">{t("dashboard.guests", { count: o.guests })}</p>
                  </div>
                  <div className="min-w-0 text-sm">
                    <p className="break-words">{o.contactName}</p>
                    <p className="break-all text-xs text-ink-faint">{o.contactEmail}</p>
                    <p className="text-xs text-ink-faint">{o.contactPhone}</p>
                  </div>
                  <p className="readout text-sm">{o.departureDate}</p>
                  <p className="readout text-sm lg:text-right">{formatVnd(o.totalVnd, locale)}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <OrderStatusControl orderId={o.id} status={o.status} />
                    <OrderDelete orderId={o.id} code={o.code} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {result.pages > 1 && (
        <nav className="mt-8 flex items-center justify-between gap-4" aria-label={t("orders.pageOf", { page: result.page, pages: result.pages })}>
          {result.page > 1 ? (
            <Link href={`/admin/orders${filtersToQuery(filters, { page: result.page - 1 })}`} className="btn btn-ghost">
              {t("orders.prev")}
            </Link>
          ) : (
            <span />
          )}
          <span className="readout text-xs text-ink-muted">{t("orders.pageOf", { page: result.page, pages: result.pages })}</span>
          {result.page < result.pages ? (
            <Link href={`/admin/orders${filtersToQuery(filters, { page: result.page + 1 })}`} className="btn btn-ghost">
              {t("orders.next")}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
