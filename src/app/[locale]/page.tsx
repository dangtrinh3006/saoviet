import { ArrowRight } from "@/components/ui/icons";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { Tonight } from "@/components/home/tonight";
import { TourCard } from "@/components/tours/tour-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SkyPlate } from "@/components/ui/sky-plate";
import { locations } from "@/content/locations";
import { posts } from "@/content/posts";
import { services } from "@/content/services";
import { tours } from "@/content/tours";
import { Link } from "@/i18n/navigation";
import { formatVnd, pick } from "@/lib/l10n";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tb = await getTranslations("blog");
  const featured = tours.filter((x) => x.featured).slice(0, 3);
  const darkest = [...locations].sort((a, b) => b.sqm - a.sqm).slice(0, 6);

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-5 pt-28 md:px-8 md:pt-40">
        <SectionHeading index="01 — TONIGHT" title={t("tonightTitle")} subtitle={t("tonightSubtitle")} />
        <Tonight />
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-28 md:px-8 md:pt-40">
        <SectionHeading
          index="02 — EXPEDITIONS"
          title={t("featuredTitle")}
          subtitle={t("featuredSubtitle")}
          action={
            <Link href="/tours" className="btn btn-ghost self-start md:self-auto">
              {t("ctaTours")} <ArrowRight size={16} />
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((tour, i) => (
            <TourCard key={tour.slug} tour={tour} index={i} />
          ))}
        </div>
      </section>

      <section className="relative mt-28 overflow-hidden border-y hairline py-24 md:mt-40 md:py-36">
        <div className="chart-grid absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <p className="readout text-xs text-ink-faint">03 — MANIFESTO</p>
            <h2 className="display mt-6 max-w-5xl text-[clamp(2.4rem,6.5vw,5.6rem)]">{t("manifestoTitle")}</h2>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-muted">{t("manifestoBody")}</p>
          </Reveal>
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border hairline bg-line md:grid-cols-3">
            {darkest.map((l, i) => (
              <Reveal key={l.slug} delay={i * 0.05} className="bg-bg p-5 md:p-8">
                <Link href={`/map?l=${l.slug}`} className="group block">
                  <p className="readout text-[clamp(2rem,5vw,3.6rem)] leading-none text-ink transition-colors group-hover:text-accent">
                    {l.sqm.toFixed(2)}
                  </p>
                  <p className="eyebrow mt-3">mag/arcsec² · Bortle {l.bortle}</p>
                  <p className="mt-4 text-sm text-ink-muted">{pick(l.name, locale)}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-28 md:px-8 md:pt-40">
        <SectionHeading
          index="04 — JOURNAL"
          title={t("journalTitle")}
          action={
            <Link href="/blog" className="btn btn-ghost self-start md:self-auto">
              {tb("title")} <ArrowRight size={16} />
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
          {posts.slice(0, 1).map((p) => (
            <Reveal key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group block">
                <SkyPlate credit={false} image={p.cover} seed={p.slug} className="aspect-[16/10] rounded-2xl" />
                <p className="eyebrow mt-5">
                  {p.category} · {tb("minutes", { count: p.readingMinutes })}
                </p>
                <h3 className="display mt-3 text-3xl transition-colors group-hover:text-accent md:text-4xl">{pick(p.title, locale)}</h3>
                <p className="mt-3 text-ink-muted">{pick(p.excerpt, locale)}</p>
              </Link>
            </Reveal>
          ))}
          <div className="divide-y divide-line border-y hairline">
            {posts.slice(1, 5).map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <Link href={`/blog/${p.slug}`} className="group flex items-start gap-5 py-5">
                  <span className="readout pt-1 text-xs text-ink-faint">0{i + 2}</span>
                  <div>
                    <h3 className="display text-xl transition-colors group-hover:text-accent">{pick(p.title, locale)}</h3>
                    <p className="eyebrow mt-2">
                      {p.category} · {tb("minutes", { count: p.readingMinutes })}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-28 md:px-8 md:pt-40">
        <SectionHeading
          index="05 — SERVICES"
          title={t("servicesTitle")}
          action={
            <Link href="/services" className="btn btn-ghost self-start md:self-auto">
              <ArrowRight size={16} />
            </Link>
          }
        />
        <div className="grid gap-px overflow-hidden rounded-2xl border hairline bg-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.04} className="bg-bg p-6 md:p-8">
              <p className="readout text-xs text-ink-faint">S-{String(i + 1).padStart(2, "0")}</p>
              <h3 className="display mt-6 text-2xl">{pick(s.title, locale)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{pick(s.body, locale)}</p>
              <p className="readout mt-6 text-sm text-accent">{formatVnd(s.fromVnd, locale)}+</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
