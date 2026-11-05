import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusChip } from "@/components/account/status-chip";
import { HideToggle } from "@/components/admin/admin-controls";
import { UserActions } from "@/components/admin/user-actions";
import { Link, redirect } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { formatVnd, pick } from "@/lib/l10n";
import { ORDER_STATUSES } from "@/lib/ops-schema";
import { listOutbox } from "@/server/admin-actions";
import { tourLookup } from "@/server/catalog";
import { adminPageSession, dashboardStats } from "@/server/ops-queries";
import { adminOverview } from "@/server/queries";

const TABS = ["moderation", "users", "outbox"] as const;
type Tab = (typeof TABS)[number];

export default async function AdminPage({ params, searchParams }: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await adminPageSession();

  const { tab: rawTab } = await searchParams;
  // The orders tab moved to its own route; keep old links working.
  if (rawTab === "orders") redirect({ href: "/admin/orders", locale });
  const tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : null;

  const t = await getTranslations("admin");
  const to = await getTranslations("adminops");

  return (
    <div>
      <p className="readout text-xs text-ink-faint">
        {to("dashboard.eyebrow")} · {session.user.email}
      </p>
      <h1 className="display mt-4 text-[clamp(2.4rem,6vw,4.5rem)]">{tab ? to(`nav.${tab}`) : to("dashboard.title")}</h1>
      {tab === null && <Dashboard locale={locale} />}
      {tab === "moderation" && <Moderation />}
      {tab === "users" && <UsersTab roleLabel={t("role")} banLabel={t("ban")} />}
      {tab === "outbox" && <Outbox />}
    </div>
  );
}

async function Dashboard({ locale }: { locale: string }) {
  const [stats, catalog, to, ta, tx, format] = await Promise.all([
    dashboardStats(),
    tourLookup(),
    getTranslations("adminops"),
    getTranslations("account"),
    getTranslations("authx.outbox"),
    getFormatter(),
  ]);
  const totalOrders = Object.values(stats.counts).reduce((a, b) => a + b, 0);

  return (
    <div className="mt-10 space-y-10">
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border hairline bg-line sm:grid-cols-3" data-testid="kpis">
        <div className="bg-bg p-5 md:p-7">
          <dt className="eyebrow">{to("dashboard.revenue")}</dt>
          <dd className="readout mt-3 break-words text-2xl md:text-3xl">{formatVnd(stats.revenue, locale)}</dd>
        </div>
        <div className="bg-bg p-5 md:p-7">
          <dt className="eyebrow">{to("nav.orders")}</dt>
          <dd className="readout mt-3 text-2xl md:text-3xl">{totalOrders}</dd>
        </div>
        <div className="bg-bg p-5 md:p-7">
          <dt className="eyebrow">{to("dashboard.openChanges")}</dt>
          <dd className="readout mt-3 text-2xl md:text-3xl">
            <Link href="/admin/queue" className="hover:text-accent">
              {stats.openChanges}
            </Link>
          </dd>
        </div>
      </dl>

      <section aria-labelledby="by-status">
        <h2 id="by-status" className="eyebrow">
          {to("dashboard.ordersByStatus")}
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {ORDER_STATUSES.map((s) => (
            <li key={s}>
              <Link href={`/admin/orders?status=${s}`} className="card flex items-center justify-between gap-3 p-4 transition-colors hover:border-accent">
                <StatusChip status={s} label={ta(`status.${s}`)} />
                <span className="readout text-xl">{stats.counts[s]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-10 xl:grid-cols-2">
        <section aria-labelledby="upcoming">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="upcoming" className="eyebrow">
              {to("dashboard.upcoming")}
            </h2>
            <Link href={`/admin/orders?from=${stats.today}&to=${stats.horizon}&sort=departure_asc`} className="text-xs text-accent">
              {to("common.viewAll")}
            </Link>
          </div>
          {stats.upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-ink-faint">{to("dashboard.upcomingEmpty", { from: stats.today, to: stats.horizon })}</p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y hairline">
              {stats.upcoming.slice(0, 10).map((o) => {
                const tour = catalog.get(o.tourSlug);
                return (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 py-3 hover:text-accent">
                      <span className="readout text-sm">{o.departureDate}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm">{tour ? pick(tour.title, locale) : o.tourSlug}</span>
                        <span className="readout block truncate text-xs text-ink-faint">
                          {o.code} · {o.contactName}
                        </span>
                      </span>
                      <span className="readout text-xs text-ink-muted">{to("dashboard.guests", { count: o.guests })}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="outbox">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="outbox" className="eyebrow">
              {to("dashboard.outbox")}
            </h2>
            <Link href="/admin?tab=outbox" className="text-xs text-accent">
              {to("common.viewAll")}
            </Link>
          </div>
          {stats.outbox.length === 0 ? (
            <p className="mt-4 text-sm text-ink-faint">{to("common.empty")}</p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y hairline">
              {stats.outbox.map((m) => (
                <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{m.subject}</span>
                    <span className="block truncate text-xs text-ink-faint">{m.to}</span>
                  </span>
                  <span className="readout text-right text-xs text-ink-muted">
                    <span className={cn("block", m.status === "failed" ? "text-danger" : m.status === "sent" ? "text-accent" : "")}>{tx(`statuses.${m.status}`)}</span>
                    <time dateTime={m.createdAt.toISOString()}>{format.relativeTime(m.createdAt)}</time>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

async function Moderation() {
  const [data, tp, format] = await Promise.all([adminOverview(), getTranslations("pages"), getFormatter()]);
  const items = [
    ...data.reviews.map((r) => ({ ...r, kind: "review" as const, label: `★ ${r.rating} · ${r.target}` })),
    ...data.comments.map((c) => ({ ...c, kind: "comment" as const, label: c.target })),
    ...data.threads.map((th) => ({ ...th, kind: "thread" as const, label: th.target })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <section className="mt-8">
      {items.length === 0 ? (
        <p className="text-ink-faint">{tp("empty")}</p>
      ) : (
        <ul className="divide-y divide-line border-y hairline">
          {items.map((m) => (
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
  );
}

async function UsersTab({ roleLabel, banLabel }: { roleLabel: string; banLabel: string }) {
  const [data, format] = await Promise.all([adminOverview(), getFormatter()]);
  return (
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
              {roleLabel}: {u.role}
              {u.banned ? ` · ${banLabel}` : ""}
            </span>
            <span className="readout col-start-2 text-xs text-ink-faint sm:col-start-auto">{format.dateTime(u.createdAt, { dateStyle: "medium" })}</span>
            <UserActions userId={u.id} userEmail={u.email} />
          </li>
        ))}
      </ul>
    </section>
  );
}

async function Outbox() {
  const [outbox, tx, format] = await Promise.all([listOutbox(), getTranslations("authx.outbox"), getFormatter()]);
  return (
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
  );
}
