import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/contact-form";
import { ArrowUpRight, Moon, Plus, Shield, User } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { contactFaq } from "@/content/legal";
import { Link } from "@/i18n/navigation";
import { CONTACT_TOPICS, type ContactTopic } from "@/lib/contact-schema";
import { pick } from "@/lib/l10n";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.contact" });
  return { title: t("title"), description: t("metaDescription") };
}

const isTopic = (v: unknown): v is ContactTopic => typeof v === "string" && (CONTACT_TOPICS as readonly string[]).includes(v);

export default async function ContactPage({ params, searchParams }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { topic } = await searchParams;
  const t = await getTranslations("legal.contact");
  const tl = await getTranslations("legal");

  const info = [
    { icon: Moon, label: t("hoursLabel"), value: t("hours"), note: t("hoursNote") },
    { icon: Shield, label: t("responseLabel"), value: t("response"), note: t("responseNote") },
    { icon: User, label: t("ownerLabel"), value: t("owner") },
  ];

  return (
    <div className="pb-10 pt-28 md:pt-40">
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <p className="readout text-xs text-ink-faint">{t("eyebrow")}</p>
            <h1 className="display mt-4 text-[clamp(3rem,8vw,6.5rem)]">{t("title")}</h1>
          </div>
          <p className="text-lg leading-relaxed text-ink-muted">{t("subtitle")}</p>
        </Reveal>
      </section>

      <section className="mx-auto mt-14 grid max-w-7xl gap-8 px-5 md:mt-20 md:px-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-12">
        <Reveal className="card relative p-6 md:p-10">
          <h2 className="display text-3xl md:text-4xl">{t("formTitle")}</h2>
          <div className="mt-8">
            <ContactForm defaultTopic={isTopic(topic) ? topic : undefined} />
          </div>
        </Reveal>

        <Reveal delay={0.08} className="flex flex-col gap-8">
          <div>
            <p className="eyebrow">{t("infoTitle")}</p>
            <dl className="mt-5 border-t hairline">
              {info.map(({ icon: Icon, label, value, note }) => (
                <div key={label} className="flex gap-4 border-b hairline py-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-line">
                    <Icon size={18} strokeWidth={1.5} />
                  </span>
                  <div>
                    <dt className="eyebrow">{label}</dt>
                    <dd className="mt-1.5 text-lg text-ink">{value}</dd>
                    {note && <dd className="mt-1 text-sm leading-relaxed text-ink-muted">{note}</dd>}
                  </div>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="eyebrow">{t("legalLabel")}</p>
            <ul className="mt-4 space-y-2">
              {(["privacy", "terms"] as const).map((doc) => (
                <li key={doc}>
                  <Link href={`/${doc}`} className="group inline-flex items-center gap-2 text-ink-muted transition-colors hover:text-accent">
                    {tl(`${doc}.title`)}
                    <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-5 md:mt-32 md:px-8">
        <SectionHeading index={t("faqEyebrow")} title={t("faqTitle")} />
        <div className="border-t hairline">
          {contactFaq.map((item, i) => (
            <details key={i} className="group border-b hairline">
              <summary className="flex cursor-pointer list-none items-start gap-5 py-6 md:gap-10 md:py-8 [&::-webkit-details-marker]:hidden">
                <span className="readout mt-1.5 text-xs text-ink-faint">Q-{String(i + 1).padStart(2, "0")}</span>
                <span className="display flex-1 text-xl transition-colors group-hover:text-accent md:text-2xl">{pick(item.q, locale)}</span>
                <span className="grid size-9 shrink-0 place-items-center rounded-full ring-1 ring-line transition-transform group-open:rotate-45">
                  <Plus size={16} />
                </span>
              </summary>
              <p className="max-w-3xl pb-8 pl-12 leading-relaxed text-ink-muted md:pl-[4.75rem]">{pick(item.a, locale)}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
