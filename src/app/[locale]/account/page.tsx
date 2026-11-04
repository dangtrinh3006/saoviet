import { ArrowRight } from "@/components/ui/icons";
import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { CancelOrderButton } from "@/components/account/cancel-order-button";
import { StatusChip } from "@/components/account/status-chip";
import { Reveal } from "@/components/ui/reveal";
import { SkyPlate } from "@/components/ui/sky-plate";
import { tourBySlug } from "@/content/tours";
import { Link, redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth";
import { formatVnd, pick } from "@/lib/l10n";
import { ordersForUser } from "@/server/queries";

export async function generateMetadata({ params }: PageProps<"/[locale]/account">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("title"), robots: { index: false } };
}

export default async function AccountPage({ params }: PageProps<"/[locale]/account">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) return redirect({ href: "/sign-in?next=/account", locale });
  const t = await getTranslations("account");
  const tp = await getTranslations("pages");
  const tours = await getTranslations("tours");
  const format = await getFormatter();
  const orders = await ordersForUser(session.user.id);
  const upcoming = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-10 pt-28 md:px-8 md:pt-40">
      <Reveal className="flex flex-col gap-6 border-b hairline pb-10 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-5">
          <span className="display grid size-16 place-items-center rounded-full bg-accent text-3xl text-accent-ink md:size-20 md:text-4xl">
            {session.user.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="eyebrow">{t("title")}</p>
            <h1 className="display mt-2 truncate text-4xl md:text-5xl">{session.user.name}</h1>
            <p className="mt-1 truncate text-sm text-ink-muted">{session.user.email}</p>
          </div>
        </div>
        <dl className="readout grid grid-cols-2 gap-8 text-sm">
          <div>
            <dt className="eyebrow">{t("orders")}</dt>
            <dd className="mt-1 text-3xl">{String(orders.length).padStart(2, "0")}</dd>
          </div>
          <div>
            <dt className="eyebrow">{tp("upcoming")}</dt>
            <dd className="mt-1 text-3xl text-accent">{String(upcoming).padStart(2, "0")}</dd>
          </div>
        </dl>
      </Reveal>

      <section className="mt-12" aria-labelledby="orders">
        <h2 id="orders" className="display text-3xl">
          {t("orders")}
        </h2>
        {orders.length === 0 ? (
          <div className="card chart-grid mt-8 flex flex-col items-center gap-6 p-12 text-center">
            <p className="text-ink-muted">{t("empty")}</p>
            <Link href="/tours" className="btn btn-primary">
              {tours("title")} <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((o, i) => {
              const tour = tourBySlug(o.tourSlug);
              return (
                <Reveal key={o.id} delay={Math.min(i, 6) * 0.04}>
                  <li className="card grid gap-5 overflow-hidden p-4 sm:grid-cols-[8rem_1fr] md:grid-cols-[10rem_1fr_auto] md:items-center md:p-5">
                    <SkyPlate credit={false} image={tour?.image} seed={o.tourSlug} className="aspect-[4/3] rounded-xl sm:aspect-square" sizes="160px" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="readout text-sm">{o.code}</span>
                        <StatusChip status={o.status} label={t(`status.${o.status}`)} />
                      </div>
                      <h3 className="display mt-2 text-2xl">
                        {tour ? (
                          <Link href={`/tours/${tour.slug}`} className="hover:text-accent">
                            {pick(tour.title, locale)}
                          </Link>
                        ) : (
                          o.tourSlug
                        )}
                      </h3>
                      <p className="readout mt-2 text-xs text-ink-muted">
                        {o.departureDate} · {o.guests} × {formatVnd(o.unitPriceVnd, locale)} ·{" "}
                        {format.dateTime(o.createdAt, { dateStyle: "medium" })}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t hairline pt-4 sm:col-span-2 md:col-span-1 md:flex-col md:items-end md:border-0 md:pt-0">
                      <span className="readout text-xl">{formatVnd(o.totalVnd, locale)}</span>
                      {o.status === "pending" && <CancelOrderButton orderId={o.id} />}
                    </div>
                  </li>
                </Reveal>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
