import { Check, Star } from "@/components/ui/icons";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingWidget } from "@/components/tours/booking-widget";
import { Itinerary3D } from "@/components/tours/itinerary-3d";
import { ReviewForm } from "@/components/tours/review-form";
import { Reveal } from "@/components/ui/reveal";
import { SkyPlate } from "@/components/ui/sky-plate";
import { locationBySlug } from "@/content/locations";
import { getTour } from "@/server/catalog";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { formatCoord, pick } from "@/lib/l10n";
import { reviewsForTour } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/tours/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const tour = await getTour(slug);
  if (!tour) return {};
  return { title: pick(tour.title, locale), description: pick(tour.tagline, locale) };
}

export default async function TourPage({ params }: PageProps<"/[locale]/tours/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tour = await getTour(slug);
  if (!tour) notFound();
  const loc = locationBySlug(tour.locationSlug);
  const t = await getTranslations("tours");
  const tm = await getTranslations("map");
  const { rows: reviews, average } = await reviewsForTour(slug).catch(() => ({ rows: [], average: null }));

  // JSON-LD lets search engines show the tour as a structured trip.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pick(tour.title, locale),
    description: pick(tour.tagline, locale),
    offers: { "@type": "Offer", price: tour.priceVnd, priceCurrency: "VND" },
    ...(average ? { aggregateRating: { "@type": "AggregateRating", ratingValue: average.toFixed(1), reviewCount: reviews.length } } : {}),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="relative">
        <SkyPlate image={tour.image} seed={tour.slug} className="h-[72svh] min-h-[480px]" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-10 md:px-8 md:pb-16">
          <Reveal>
            <p className="readout text-xs text-white/70">
              {tour.code} · {loc && formatCoord(loc.lat, loc.lng)}
            </p>
            <h1 className="display mt-4 max-w-4xl text-[clamp(2.6rem,7vw,6rem)] text-white">{pick(tour.title, locale)}</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">{pick(tour.tagline, locale)}</p>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-12 md:px-8 lg:grid-cols-[1fr_420px] lg:gap-16">
        <div className="space-y-16">
          <dl className="readout grid grid-cols-2 gap-px overflow-hidden rounded-2xl border hairline bg-line text-sm md:grid-cols-4">
            {[
              [t("nights", { count: tour.nights }).replace(/^\d+\s*/, ""), String(tour.nights)],
              ["SQM", loc?.sqm.toFixed(2) ?? "—"],
              [tm("bortle"), String(loc?.bortle ?? "—")],
              [t("difficulty." + tour.difficulty), `≤ ${tour.maxGuests}`],
            ].map(([k, v]) => (
              <div key={k} className="bg-bg p-5">
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-2 text-2xl">{v}</dd>
              </div>
            ))}
          </dl>

          <section>
            <h2 className="eyebrow mb-6">{t("highlights")}</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {tour.highlights.map((h, i) => (
                <Reveal key={i} delay={i * 0.05} className="flex gap-4 border-t hairline pt-4">
                  <span className="readout text-xs text-accent">0{i + 1}</span>
                  <p className="text-ink-muted">{pick(h, locale)}</p>
                </Reveal>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="eyebrow mb-6">{t("itinerary")}</h2>
            <Itinerary3D
              seedKey={tour.slug}
              steps={tour.itinerary.map((step) => ({ title: pick(step.title, locale), body: pick(step.body, locale) }))}
            />
          </section>

          <section>
            <h2 className="eyebrow mb-6">{t("includes")}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {tour.includes.map((x, i) => (
                <li key={i} className="flex items-start gap-3 text-ink-muted">
                  <Check size={16} className="mt-1 shrink-0 text-accent" /> {pick(x, locale)}
                </li>
              ))}
            </ul>
            {loc && (
              <Link href={`/map?l=${loc.slug}`} className="btn btn-ghost mt-8">
                {tm("title")} · {pick(loc.name, locale)}
              </Link>
            )}
          </section>

          <section>
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="eyebrow">{t("reviews")}</h2>
              {average && (
                <p className="readout flex items-center gap-1 text-sm">
                  <Star size={14} className="fill-accent text-accent" /> {average.toFixed(1)} · {reviews.length}
                </p>
              )}
            </div>
            <div className="space-y-4">
              {reviews.length === 0 && <p className="text-ink-muted">{t("noReviews")}</p>}
              {reviews.map((r) => (
                <div key={r.id} className="border-t hairline pt-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.author.name}</p>
                    <p className="text-accent">{"★".repeat(r.rating)}<span className="text-ink-faint">{"★".repeat(5 - r.rating)}</span></p>
                  </div>
                  <p className="mt-2 text-ink-muted">{r.body}</p>
                  <p className="readout mt-2 text-xs text-ink-faint">{r.createdAt.toLocaleDateString(locale === "en" ? "en-GB" : "vi-VN")}</p>
                </div>
              ))}
              <ReviewForm tourSlug={tour.slug} />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <BookingWidget tour={tour} />
        </aside>
      </div>
    </article>
  );
}
