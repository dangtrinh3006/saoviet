import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusChip } from "@/components/account/status-chip";
import { AuditList } from "@/components/admin/audit-list";
import { UserActions } from "@/components/admin/user-actions";
import { UserAdminPanel } from "@/components/admin/user-admin-panel";
import { ArrowLeft } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { formatVnd, pick } from "@/lib/l10n";
import { tourLookup } from "@/server/catalog";
import { adminPageSession } from "@/server/ops-queries";
import { adminUserDetail } from "@/server/user-queries";

export default async function AdminUserPage({ params }: PageProps<"/[locale]/admin/users/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await adminPageSession();
  const data = await adminUserDetail(id);
  if (!data) notFound();
  const [t, ta, format, tours] = await Promise.all([getTranslations("adminusers"), getTranslations("account"), getFormatter(), tourLookup()]);
  const { user: u } = data;
  const date = (d: Date) => format.dateTime(d, { dateStyle: "medium" });
  const tourName = (slug: string) => {
    const tour = tours.get(slug);
    return tour ? pick(tour.title, locale) : slug;
  };

  return (
    <div>
      <Link href="/admin?tab=users" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={14} /> {t("back")}
      </Link>

      <header className="mt-4 flex flex-wrap items-center gap-5">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-surface text-2xl ring-1 ring-line">{u.name.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0">
          <h1 className="display break-words text-[clamp(1.8rem,4.5vw,3rem)]">{u.name}</h1>
          <p className="break-all text-ink-muted">{u.email}</p>
          <p className="readout mt-1 flex flex-wrap gap-x-3 text-xs text-ink-faint">
            <span>{t("joined", { date: date(u.createdAt) })}</span>
            <span className={u.emailVerified ? "text-accent" : undefined}>{u.emailVerified ? t("verified") : t("notVerified")}</span>
            <span>
              {t("sessions", { count: data.activeSessions })}
              {data.lastActive && ` · ${t("lastActive", { date: format.dateTime(data.lastActive, { dateStyle: "short", timeStyle: "short" }) })}`}
            </span>
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="eyebrow">{t("signInMethods")}</span>
            {data.providers.map((p) => (
              <span key={p} className="rounded-full px-2.5 py-1 ring-1 ring-line">
                {t.has(`provider.${p}`) ? t(`provider.${p}`) : p}
              </span>
            ))}
          </p>
        </div>
      </header>

      <div className="mt-10 space-y-10">
        <UserAdminPanel userId={u.id} role={u.role === "admin" ? "admin" : "user"} banned={Boolean(u.banned)} banReason={u.banReason} />

        <div className="grid grid-cols-[auto_1fr]">
          <UserActions userId={u.id} userEmail={u.email} />
        </div>

        <section>
          <h2 className="display text-2xl">
            {t("orders")} <span className="readout text-base text-ink-faint">{data.orders.length}</span>
          </h2>
          {data.orders.length === 0 ? (
            <p className="mt-3 text-ink-faint">{t("none")}</p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y hairline">
              {data.orders.map((o) => (
                <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="min-w-0 hover:text-accent">
                    <span className="readout text-sm">{o.code}</span> <span className="truncate text-ink-muted">· {tourName(o.tourSlug)}</span>
                    <span className="block text-xs text-ink-faint">
                      {o.departureDate} · {formatVnd(o.totalVnd, locale)}
                    </span>
                  </Link>
                  <StatusChip status={o.status} label={ta(`status.${o.status}`)} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="display text-2xl">
              {t("reviews")} <span className="readout text-base text-ink-faint">{data.reviews.length}</span>
            </h2>
            {data.reviews.length === 0 ? (
              <p className="mt-3 text-ink-faint">{t("none")}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {data.reviews.map((r) => (
                  <li key={r.id} className={cn("rounded-xl p-4 ring-1 ring-line", r.hidden && "opacity-60")}>
                    <p className="text-xs text-ink-faint">
                      {"★".repeat(r.rating)} · {tourName(r.tourSlug)} · {date(r.createdAt)}
                      {r.hidden && ` · ${t("hidden")}`}
                    </p>
                    <p className="mt-1 line-clamp-3 text-sm">{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="display text-2xl">
              {t("comments")} <span className="readout text-base text-ink-faint">{data.comments.length}</span>
            </h2>
            {data.comments.length === 0 ? (
              <p className="mt-3 text-ink-faint">{t("none")}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {data.comments.map((c) => (
                  <li key={c.id} className={cn("rounded-xl p-4 ring-1 ring-line", c.hidden && "opacity-60")}>
                    <p className="text-xs text-ink-faint">
                      {c.targetId} · {date(c.createdAt)}
                      {c.hidden && ` · ${t("hidden")}`}
                    </p>
                    <p className="mt-1 line-clamp-3 text-sm">{c.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section>
          <h2 className="display text-2xl">{t("history")}</h2>
          <div className="mt-4">
            <AuditList entries={data.history} showTarget={false} />
          </div>
        </section>
      </div>
    </div>
  );
}
