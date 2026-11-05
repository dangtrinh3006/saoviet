import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServiceForm } from "@/components/admin/ops/service-form";
import { ArrowLeft } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { adminPageSession, getServiceAdmin } from "@/server/ops-queries";

export default async function EditServicePage({ params }: PageProps<"/[locale]/admin/services/[slug]/edit">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  await adminPageSession();
  const row = await getServiceAdmin(slug);
  if (!row) notFound();
  const t = await getTranslations("adminops");
  return (
    <div>
      <Link href="/admin/services" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={14} /> {t("services.title")}
      </Link>
      <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.75rem)]">{t("services.edit")}</h1>
      <p className="readout mt-2 text-xs text-ink-faint">{row.slug}</p>
      <ServiceForm
        mode="edit"
        initial={{ slug: row.slug, icon: row.icon, title: row.title, body: row.body, fromVnd: row.fromVnd, status: row.status }}
      />
    </div>
  );
}
