import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServiceForm } from "@/components/admin/ops/service-form";
import { ArrowLeft } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { adminPageSession } from "@/server/ops-queries";

export default async function NewServicePage({ params }: PageProps<"/[locale]/admin/services/new">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await adminPageSession();
  const t = await getTranslations("adminops");
  return (
    <div>
      <Link href="/admin/services" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={14} /> {t("services.title")}
      </Link>
      <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.75rem)]">{t("services.new")}</h1>
      <ServiceForm mode="create" />
    </div>
  );
}
