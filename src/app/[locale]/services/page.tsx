import { ArrowRight, Camera, GraduationCap, Moon, Telescope, Tent, Users } from "@/components/ui/icons";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/ui/reveal";
import { listServices } from "@/server/catalog";
import type { Service } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { formatVnd, pick } from "@/lib/l10n";

const ICONS: Record<Service["icon"], typeof Camera> = {
  telescope: Telescope,
  camera: Camera,
  tent: Tent,
  users: Users,
  graduation: GraduationCap,
  moon: Moon,
};

export async function generateMetadata({ params }: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return { title: t("servicesTitle"), description: t("servicesSubtitle") };
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const services = await listServices();
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  const nav = await getTranslations("nav");

  return (
    <div className="pb-10 pt-28 md:pt-40">
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <p className="readout text-xs text-ink-faint">SERVICES · {String(services.length).padStart(2, "0")}</p>
            <h1 className="display mt-4 text-[clamp(3rem,8vw,6.5rem)]">{t("servicesTitle")}</h1>
          </div>
          <p className="text-lg leading-relaxed text-ink-muted">{t("servicesSubtitle")}</p>
        </Reveal>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-8">
        <ol className="border-t hairline">
          {services.map((s, i) => {
            const Icon = ICONS[s.icon];
            return (
              <Reveal key={s.slug} delay={i * 0.04}>
                <li className="group grid grid-cols-[auto_1fr] gap-x-5 gap-y-4 border-b hairline py-8 md:grid-cols-[5rem_auto_1fr_auto] md:items-center md:gap-x-10 md:py-12">
                  <span className="readout text-xs text-ink-faint md:text-sm">S-{String(i + 1).padStart(2, "0")}</span>
                  <span className="grid size-12 place-items-center rounded-full ring-1 ring-line transition-colors group-hover:bg-accent group-hover:text-accent-ink md:order-none md:size-16">
                    <Icon size={22} strokeWidth={1.5} />
                  </span>
                  <div className="col-span-2 md:col-span-1">
                    <h2 className="display text-3xl transition-colors group-hover:text-accent md:text-4xl">{pick(s.title, locale)}</h2>
                    <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">{pick(s.body, locale)}</p>
                  </div>
                  <p className="col-span-2 md:col-span-1 md:text-right">
                    <span className="eyebrow block">{t("fromPrice")}</span>
                    <span className="readout mt-1 block text-xl text-ink">{formatVnd(s.fromVnd, locale)}</span>
                  </p>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-5 md:px-8">
        <Reveal className="card chart-grid relative overflow-hidden p-8 md:p-16">
          <div className="relative max-w-2xl">
            <p className="eyebrow">{t("servicesCtaEyebrow")}</p>
            <h2 className="display mt-4 text-4xl md:text-6xl">{t("servicesCtaTitle")}</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tours" className="btn btn-primary">
                {nav("tours")} <ArrowRight size={16} />
              </Link>
              <Link href="/forum" className="btn btn-ghost">
                {nav("forum")}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
