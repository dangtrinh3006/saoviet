import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Entry = {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: Record<string, unknown> | null;
  createdAt: Date;
};

function describe(detail: Entry["detail"]) {
  if (!detail) return null;
  if ("from" in detail && "to" in detail) return `${detail.from} → ${detail.to}`;
  if ("status" in detail) return String(detail.status);
  if ("reason" in detail) return String(detail.reason);
  if (Array.isArray(detail.changes)) return detail.changes.join("; ");
  return null;
}

/** Server-rendered trail; the target links back to the user or order it touched. */
export async function AuditList({ entries, showTarget = true }: { entries: Entry[]; showTarget?: boolean }) {
  const [t, format] = await Promise.all([getTranslations("adminusers.audit"), getFormatter()]);
  if (entries.length === 0) return <p className="text-ink-faint">{t("empty")}</p>;
  return (
    <ol className="divide-y divide-line border-y hairline">
      {entries.map((e) => {
        const href = e.targetType === "user" ? `/admin/users/${e.targetId}` : e.targetType === "order" ? `/admin/orders/${e.targetId}` : null;
        const extra = describe(e.detail);
        return (
          <li key={e.id} className="grid gap-x-6 gap-y-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <p className="font-medium">
                {t.has(`actions.${e.action}`) ? t(`actions.${e.action}`) : e.action}
                {extra && <span className="ml-2 text-sm font-normal text-ink-muted">{extra}</span>}
              </p>
              <p className="truncate text-xs text-ink-faint">
                {showTarget && href && (
                  <>
                    <Link href={href} className="text-accent hover:underline">
                      {t.has(`targets.${e.targetType}`) ? t(`targets.${e.targetType}`) : e.targetType}
                    </Link>
                    {" · "}
                  </>
                )}
                {t("by", { email: e.actorEmail })}
              </p>
            </div>
            <time dateTime={e.createdAt.toISOString()} className="readout text-xs text-ink-muted sm:text-right">
              {format.dateTime(e.createdAt, { dateStyle: "short", timeStyle: "short" })}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
