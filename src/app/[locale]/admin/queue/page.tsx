import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { CHANGE_STATUS_TONE } from "@/components/admin/ops/change-status";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { CHANGE_STATUSES } from "@/lib/ops-schema";
import { adminPageSession, listChangeRequests } from "@/server/ops-queries";

export default async function QueuePage({ params, searchParams }: PageProps<"/[locale]/admin/queue">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await adminPageSession();
  const raw = (await searchParams).status;
  const status = CHANGE_STATUSES.find((s) => s === raw);
  const [rows, t, format] = await Promise.all([listChangeRequests(status), getTranslations("adminops"), getFormatter()]);

  const filters = [
    { key: "all", href: "/admin/queue", active: !status },
    ...CHANGE_STATUSES.map((s) => ({ key: s, href: `/admin/queue?status=${s}`, active: status === s })),
  ];

  return (
    <div>
      <h1 className="display text-[clamp(2.2rem,5vw,3.75rem)]">{t("queue.title")}</h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-muted">{t("queue.explain")}</p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <li key={f.key}>
            <Link
              href={f.href}
              aria-current={f.active ? "page" : undefined}
              className={cn("inline-flex rounded-full px-3 py-1.5 text-xs ring-1", f.active ? "bg-surface text-ink ring-line-strong" : "text-ink-muted ring-line hover:text-ink")}
            >
              {f.key === "all" ? t("queue.all") : t(`queue.statuses.${f.key}`)}
            </Link>
          </li>
        ))}
      </ul>

      {rows.length === 0 ? (
        <p className="mt-8 text-ink-faint">{t("common.empty")}</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y hairline">
          {rows.map(({ row, author }) => (
            <li key={row.id}>
              <Link href={`/admin/queue/${row.id}`} className="grid gap-2 py-4 hover:text-accent sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
                <span className="min-w-0">
                  <span className="eyebrow block">{t.has(`queue.kinds.${row.kind}`) ? t(`queue.kinds.${row.kind}`) : row.kind}</span>
                  <span className="mt-1 block break-words font-medium">{row.title}</span>
                  <span className="mt-1 block truncate text-xs text-ink-faint">
                    {author?.name ?? "—"} · {format.relativeTime(row.createdAt)}
                  </span>
                </span>
                <span className={cn("readout w-fit rounded-full px-2.5 py-1 text-[11px] uppercase", CHANGE_STATUS_TONE[row.status])}>{t(`queue.statuses.${row.status}`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
