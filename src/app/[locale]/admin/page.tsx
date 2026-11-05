import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusChip } from "@/components/account/status-chip";
import { HideToggle, OrderStatusSelect } from "@/components/admin/admin-controls";
import { UserActions } from "@/components/admin/user-actions";
import { tourLookup } from "@/server/catalog";
import { Link } from "@/i18n/navigation";
import { getFreshSession } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { formatVnd, pick } from "@/lib/l10n";
import { listOutbox } from "@/server/admin-actions";
import { adminOverview } from "@/server/queries";

const TABS = ["orders", "moderation", "users", "outbox"] as const;
type Tab = (typeof TABS)[number];

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminPage({ params, searchParams }: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Non-admins get a 404 rather than a 403, so the route does not advertise itself.
  const session = await getFreshSession();
  const catalog = await tourLookup();
  if (session?.user.role !== "admin") notFound();

  const { tab: rawTab } = await searchParams;
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "orders";
  const t = await getTranslations("admin");
  const ta = await getTranslations("account");
  const tp = await getTranslations("pages");
  const tx = await getTranslations("authx.outbox");
  const format = await getFormatter();
  const data = await adminOverview();
  const outbox = tab === "outbox" ? await listOutbox() : [];
  const pendingCount = data.orders.filter((o) => o.status === "pending").length;

  const kpis = [
    [t("orders"), String(data.orders.length)],
    [t("revenue"), formatVnd(data.revenue, locale)],
    [ta("status.pending"), String(pendingCount)],
    [t("users"), String(data.users.length)],
  ];

  const moderation = [
    ...data.reviews.map((r) => ({ ...r, kind: "review" as const, label: `★ ${r.rating} · ${r.target}` })),
    ...data.comments.map((c) => ({ ...c, kind: "comment" as const, label: c.target })),
    ...data.threads.map((th) => ({ ...th, kind: "thread" as const, label: th.target })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="mx-auto max-w-7xl px-5 pb-10 pt-28 md:px-8 md:pt-36">
      <p className="readout text-xs text-ink-faint">CONTROL ROOM · {session.user.email}</p>
      <h1 className="display mt-4 text-[clamp(2.6rem,7vw,5rem)]">{t("title")}</h1>

      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border hairline bg-line lg:grid-cols-4">
        {kpis.map(([k, v]) => (
          <div key={k} className="bg-bg p-5 md:p-7">
            <dt className="eyebrow">{k}</dt>
            <dd className="readout mt-3 break-words text-2xl md:text-4xl">{v}</dd>
          </div>
        ))}
      </dl>

      <nav className="-mx-5 mt-12 flex gap-2 overflow-x-auto border-b hairline px-5 md:mx-0 md:px-0" aria-label={t("title")}>
        {TABS.map((k) => (
          <Link
            key={k}
            href={`/admin?tab=${k}`}
            aria-current={tab === k ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-3 text-sm transition-colors",
              tab === k ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {k === "outbox" ? tx("tab") : t(k)}
          </Link>
        ))}
      </nav>

      {tab === "orders" && (
        <section className="mt-8">
          {data.orders.length === 0 ? (
            <p className="text-ink-faint">{tp("empty")}</p>
          ) : (
            <>
              {/* Table from md up; stacked cards on phones. */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="eyebrow">
                    <tr className="border-b hairline">
                      <th className="py-3 pr-4 font-normal">Code</th>
                      <th className="py-3 pr-4 font-normal">Tour</th>
                      <th className="py-3 pr-4 font-normal">{tp("contact")}</th>
                      <th className="py-3 pr-4 font-normal">{tp("departure")}</th>
                      <th className="py-3 pr-4 text-right font-normal">{tp("total")}</th>
                      <th className="py-3 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {data.orders.map((o) => {
                      const tour = catalog.get(o.tourSlug);
                      return (
                        <tr key={o.id} className="align-top">
                          <td className="readout py-4 pr-4">{o.code}</td>
                          <td className="py-4 pr-4">
                            {tour ? pick(tour.title, locale) : o.tourSlug}
                            <span className="readout block text-xs text-ink-faint">{o.guests} pax</span>
                          </td>
                          <td className="py-4 pr-4">
                            {o.contactName}
                            <span className="block text-xs text-ink-faint">
                              {o.contactEmail} · {o.contactPhone}
                            </span>
                          </td>
                          <td className="readout py-4 pr-4">{o.departureDate}</td>
                          <td className="readout py-4 pr-4 text-right">{formatVnd(o.totalVnd, locale)}</td>
                          <td className="py-4">
                            <OrderStatusSelect orderId={o.id} status={o.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <ul className="space-y-3 md:hidden">
                {data.orders.map((o) => {
                  const tour = catalog.get(o.tourSlug);
                  return (
                    <li key={o.id} className="card space-y-3 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="readout text-sm">{o.code}</span>
                        <StatusChip status={o.status} label={ta(`status.${o.status}`)} />
                      </div>
                      <p className="display text-xl">{tour ? pick(tour.title, locale) : o.tourSlug}</p>
                      <p className="break-words text-xs text-ink-muted">
                        {o.contactName} · {o.contactEmail} · {o.contactPhone}
                      </p>
                      <div className="readout flex justify-between text-xs text-ink-muted">
                        <span>
                          {o.departureDate} · {o.guests} pax
                        </span>
                        <span className="text-ink">{formatVnd(o.totalVnd, locale)}</span>
                      </div>
                      <OrderStatusSelect orderId={o.id} status={o.status} />
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      )}

      {tab === "moderation" && (
        <section className="mt-8">
          {moderation.length === 0 ? (
            <p className="text-ink-faint">{tp("empty")}</p>
          ) : (
            <ul className="divide-y divide-line border-y hairline">
              {moderation.map((m) => (
                <li key={`${m.kind}-${m.id}`} className={cn("flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between", m.hidden && "opacity-55")}>
                  <div className="min-w-0">
                    <p className="eyebrow">
                      {tp(`kind.${m.kind}`)} · {m.label}
                    </p>
                    <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed">{m.body}</p>
                    <p className="mt-2 text-xs text-ink-faint">
                      {m.author.name} · {format.relativeTime(m.createdAt)}
                    </p>
                  </div>
                  <HideToggle kind={m.kind} id={m.id} hidden={m.hidden} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "users" && (
        <section className="mt-8">
          <ul className="divide-y divide-line border-y hairline">
            {data.users.map((u) => (
              <li key={u.id} className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 py-4 sm:grid-cols-[auto_1fr_auto_auto]">
                <span className="grid size-9 place-items-center rounded-full bg-surface text-sm ring-1 ring-line">{u.name.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{u.name}</p>
                  <p className="truncate text-xs text-ink-faint">{u.email}</p>
                </div>
                <span className={cn("readout col-start-2 text-xs uppercase sm:col-start-auto", u.role === "admin" ? "text-accent" : "text-ink-muted")}>
                  {t("role")}: {u.role}
                  {u.banned ? ` · ${t("ban")}` : ""}
                </span>
                <span className="readout col-start-2 text-xs text-ink-faint sm:col-start-auto">{format.dateTime(u.createdAt, { dateStyle: "medium" })}</span>
                <UserActions userId={u.id} userEmail={u.email} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "outbox" && (
        <section className="mt-8">
          {outbox.length === 0 ? (
            <p className="text-ink-faint">{tx("empty")}</p>
          ) : (
            <ul className="divide-y divide-line border-y hairline">
              {outbox.map((m) => (
                <li key={m.id} className="py-4">
                  <div className="grid gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{m.subject}</p>
                      <p className="truncate text-xs text-ink-faint">
                        {tx("to")}: {m.to}
                      </p>
                    </div>
                    <p className="readout flex flex-wrap gap-x-3 text-xs text-ink-muted sm:justify-end">
                      <span>{tx.has(`kinds.${m.kind}`) ? tx(`kinds.${m.kind}`) : m.kind}</span>
                      <span className={cn(m.status === "failed" ? "text-danger" : m.status === "sent" ? "text-accent" : "text-ink-muted")}>{tx(`statuses.${m.status}`)}</span>
                      <time dateTime={m.createdAt.toISOString()}>{format.dateTime(m.createdAt, { dateStyle: "short", timeStyle: "medium" })}</time>
                    </p>
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-accent">{tx("details")}</summary>
                    {m.error && (
                      <p className="mt-2 break-words text-xs text-danger">
                        {tx("error")}: {m.error}
                      </p>
                    )}
                    <pre className="card mt-3 max-h-96 select-all overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-relaxed">{m.text}</pre>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
