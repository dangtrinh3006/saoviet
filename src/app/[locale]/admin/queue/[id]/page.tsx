import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { CHANGE_STATUS_TONE } from "@/components/admin/ops/change-status";
import { ChangeRequestActions } from "@/components/admin/ops/ops-controls";
import { ArrowLeft } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { adminPageSession, getChangeRequest } from "@/server/ops-queries";

export default async function QueueItemPage({ params }: PageProps<"/[locale]/admin/queue/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await adminPageSession();
  const item = await getChangeRequest(id);
  if (!item) notFound();
  const { row, author } = item;
  const [t, format] = await Promise.all([getTranslations("adminops"), getFormatter()]);
  const when = (d: Date) => format.dateTime(d, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div>
      <Link href="/admin/queue" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={14} /> {t("queue.title")}
      </Link>
      <p className="eyebrow mt-6">{t.has(`queue.kinds.${row.kind}`) ? t(`queue.kinds.${row.kind}`) : row.kind}</p>
      <h1 className="display mt-3 break-words text-[clamp(2rem,5vw,3.25rem)]">{row.title}</h1>
      <p className="mt-3">
        <span className={cn("readout rounded-full px-2.5 py-1 text-[11px] uppercase", CHANGE_STATUS_TONE[row.status])} data-testid="cr-status">
          {t(`queue.statuses.${row.status}`)}
        </span>
      </p>

      <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="eyebrow">{t("queue.createdBy")}</dt>
          <dd className="mt-1 break-words">{author ? `${author.name} · ${author.email}` : "—"}</dd>
        </div>
        <div>
          <dt className="eyebrow">{t("queue.created")}</dt>
          <dd className="readout mt-1">{when(row.createdAt)}</dd>
        </div>
        <div>
          <dt className="eyebrow">{t("queue.resolved")}</dt>
          <dd className="readout mt-1">{row.resolvedAt ? when(row.resolvedAt) : "—"}</dd>
        </div>
      </dl>

      <section className="mt-8">
        <h2 className="eyebrow">{t("queue.details")}</h2>
        <p className="mt-2 max-w-3xl whitespace-pre-wrap break-words leading-relaxed">{row.details}</p>
      </section>

      <section className="mt-8">
        <h2 className="eyebrow">{t("queue.payload")}</h2>
        {row.payload ? (
          <pre className="card mt-2 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-relaxed" data-testid="cr-payload">
            {JSON.stringify(row.payload, null, 2)}
          </pre>
        ) : (
          <p className="mt-2 text-sm text-ink-faint">{t("queue.noPayload")}</p>
        )}
      </section>

      <section className="mt-10 max-w-2xl">
        <ChangeRequestActions id={row.id} status={row.status} note={row.resolutionNote} />
      </section>
    </div>
  );
}
