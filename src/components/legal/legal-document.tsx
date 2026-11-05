import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Plus } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import type { LegalBlock, LegalDoc } from "@/content/legal";
import { Link } from "@/i18n/navigation";
import { pick } from "@/lib/l10n";
import { LegalToc } from "./legal-toc";

type Props = {
  doc: LegalDoc;
  locale: string;
  eyebrow: string;
  title: string;
  intro: string;
  /** Shown as a highlighted statement right under the title. */
  lead?: string;
  contactHref: string;
  seeAlso: { href: string; label: string };
};

export function formatLegalDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${iso}T00:00:00+07:00`));
}

export async function LegalDocument({ doc, locale, eyebrow, title, intro, lead, contactHref, seeAlso }: Props) {
  const t = await getTranslations({ locale, namespace: "legal" });
  const entries = doc.sections.map((s) => ({ id: s.id, title: pick(s.title, locale) }));

  // Text tokens like "{contact}" become real links instead of raw addresses.
  const rich = (text: string): ReactNode[] =>
    text.split(/(\{contact\})/).map((part, i) =>
      part === "{contact}" ? (
        <Link key={i} href={contactHref} className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          {t("contactLink")}
        </Link>
      ) : (
        part
      ),
    );

  const renderBlock = (block: LegalBlock, key: number) => {
    switch (block.kind) {
      case "p":
        return (
          <p key={key} className="leading-relaxed text-ink-muted">
            {rich(pick(block.text, locale))}
          </p>
        );
      case "note":
        return (
          <p key={key} className="rounded-xl border-l-2 border-accent bg-accent/5 px-5 py-4 text-sm leading-relaxed text-ink-muted">
            {rich(pick(block.text, locale))}
          </p>
        );
      case "ul":
        return (
          <ul key={key} className="space-y-3">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3 leading-relaxed text-ink-muted">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{rich(pick(item, locale))}</span>
              </li>
            ))}
          </ul>
        );
      case "table":
        return (
          <div key={key} className="overflow-x-auto rounded-xl border hairline">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead className="bg-surface">
                <tr>
                  {block.head.map((h, i) => (
                    <th key={i} scope="col" className="eyebrow border-b hairline px-4 py-3 font-normal">
                      {pick(h, locale)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="border-b hairline last:border-b-0">
                    {row.map((cell, c) =>
                      c === 0 ? (
                        <th key={c} scope="row" className="px-4 py-3 align-top font-medium text-ink">
                          {pick(cell, locale)}
                        </th>
                      ) : (
                        <td key={c} className="px-4 py-3 align-top leading-relaxed text-ink-muted">
                          {pick(cell, locale)}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="pb-10 pt-28 md:pt-40">
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="max-w-4xl">
          <p className="readout text-xs text-ink-faint">{eyebrow}</p>
          <h1 className="display mt-4 text-[clamp(2.6rem,6.5vw,5.5rem)]">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">{intro}</p>
          <dl className="readout mt-8 flex flex-wrap gap-x-8 gap-y-2 text-xs text-ink-faint">
            <div className="flex gap-2">
              <dt>{t("effective")}</dt>
              <dd className="text-ink">
                <time dateTime={doc.effective}>{formatLegalDate(doc.effective, locale)}</time>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt>{t("version")}</dt>
              <dd className="text-ink">{doc.version}</dd>
            </div>
          </dl>
          {lead && (
            <p className="card mt-10 max-w-3xl px-6 py-5 leading-relaxed text-ink">
              <span className="eyebrow mb-2 block text-accent">Sao Việt</span>
              {lead}
            </p>
          )}
        </Reveal>
      </section>

      <div className="mx-auto mt-14 grid max-w-7xl gap-12 px-5 md:mt-20 md:px-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <LegalToc entries={entries} label={t("toc")} />
          </div>
        </aside>

        <details className="card group px-5 py-4 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
            <span className="eyebrow">{t("tocToggle")}</span>
            <Plus size={16} className="transition-transform group-open:rotate-45" />
          </summary>
          <ol className="mt-4 space-y-2 border-t hairline pt-4">
            {entries.map((e, i) => (
              <li key={e.id}>
                <a href={`#${e.id}`} className="flex gap-3 text-sm text-ink-muted hover:text-ink">
                  <span className="readout text-xs text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                  {e.title}
                </a>
              </li>
            ))}
          </ol>
        </details>

        <article className="min-w-0 max-w-3xl">
          {doc.sections.map((section, i) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28 border-t hairline py-10 first:border-t-0 first:pt-0 md:py-12">
              <p className="readout text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h2 id={`${section.id}-title`} className="display mt-3 text-3xl md:text-4xl">
                {pick(section.title, locale)}
              </h2>
              <div className="mt-6 space-y-5">{section.blocks.map(renderBlock)}</div>
            </section>
          ))}

          <div className="card relative mt-6 overflow-hidden p-8 md:p-12">
            <div aria-hidden className="chart-grid absolute inset-0 opacity-60" />
            <div className="relative">
              <h2 className="display text-3xl md:text-4xl">{t("questions")}</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-ink-muted">{t("questionsBody")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={contactHref} className="btn btn-primary">
                  {t("goContact")} <ArrowRight size={16} />
                </Link>
                <Link href={seeAlso.href} className="btn btn-ghost">
                  {seeAlso.label}
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
