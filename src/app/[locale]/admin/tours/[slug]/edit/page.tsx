import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { PublishChip } from "@/components/admin/catalog/publish-chip";
import { TourForm } from "@/components/admin/catalog/tour-form";
import { ArrowUpRight } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { getFreshSession } from "@/lib/auth";
import { SLUG_RE, tourToFormValues } from "@/lib/catalog-schema";
import { pick } from "@/lib/l10n";
import { getTourRow } from "@/server/admin-catalog";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function EditTourPage({ params, searchParams }: PageProps<"/[locale]/admin/tours/[slug]/edit">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const session = await getFreshSession();
  if (session?.user.role !== "admin") notFound();
  if (!SLUG_RE.test(slug)) notFound();
  const row = await getTourRow(slug);
  if (!row) notFound();

  const { created } = await searchParams;
  const t = await getTranslations("admincatalog");
  const format = await getFormatter();

  return (
    <div>
      <p className="readout text-xs text-ink-faint">
        <Link href="/admin/tours" className="hover:text-ink">
          {t("eyebrow")}
        </Link>{" "}
        · {row.code}
      </p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display min-w-0 break-words text-[clamp(2.2rem,5vw,3.75rem)]">{pick(row.title, locale)}</h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          <PublishChip status={row.status} label={t(`status.${row.status}`)} />
          <span className="readout">
            {t("cols.updated")}: {format.dateTime(row.updatedAt, { dateStyle: "medium", timeStyle: "short" })}
          </span>
          {row.status === "published" && (
            <Link href={`/tours/${row.slug}`} className="inline-flex items-center gap-1 text-accent hover:underline">
              {t("actions.viewPublic")} <ArrowUpRight size={13} />
            </Link>
          )}
        </div>
      </div>
      <TourForm mode="edit" initial={tourToFormValues(row)} created={created === "1"} />
    </div>
  );
}
