import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TourForm } from "@/components/admin/catalog/tour-form";
import { Link } from "@/i18n/navigation";
import { getFreshSession } from "@/lib/auth";
import { emptyTourValues } from "@/lib/catalog-schema";
import { nextTourCode } from "@/server/admin-catalog";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function NewTourPage({ params }: PageProps<"/[locale]/admin/tours/new">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getFreshSession();
  if (session?.user.role !== "admin") notFound();
  const t = await getTranslations("admincatalog");
  const initial = { ...emptyTourValues(), code: await nextTourCode() };

  return (
    <div>
      <p className="readout text-xs text-ink-faint">
        <Link href="/admin/tours" className="hover:text-ink">
          {t("eyebrow")}
        </Link>{" "}
        · {t("newEyebrow")}
      </p>
      <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.75rem)]">{t("newTitle")}</h1>
      <TourForm mode="create" initial={initial} />
    </div>
  );
}
