import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuditList } from "@/components/admin/audit-list";
import { requireAdmin } from "@/lib/auth";
import { listAudit } from "@/server/audit";
import { adminPageSession } from "@/server/ops-queries";

export default async function AdminAuditPage({ params }: PageProps<"/[locale]/admin/audit">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await adminPageSession();
  await requireAdmin();
  const [entries, t] = await Promise.all([listAudit({ limit: 300 }), getTranslations("adminusers.audit")]);
  return (
    <div>
      <h1 className="display text-[clamp(2.4rem,6vw,4.5rem)]">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">{t("subtitle")}</p>
      <div className="mt-8">
        <AuditList entries={entries} />
      </div>
    </div>
  );
}
