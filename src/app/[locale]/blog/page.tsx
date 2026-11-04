import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/ui/reveal";
import { SkyPlate } from "@/components/ui/sky-plate";
import { posts } from "@/content/posts";
import type { Post } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { pick } from "@/lib/l10n";

const CATEGORIES: Post["category"][] = ["guide", "story", "science", "gear"];

export async function generateMetadata({ params }: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function BlogPage({ params, searchParams }: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { c } = await searchParams;
  const t = await getTranslations("blog");
  const tp = await getTranslations("pages");
  const active = CATEGORIES.includes(c as Post["category"]) ? (c as Post["category"]) : null;
  const list = [...posts].filter((p) => !active || p.category === active).sort((a, b) => b.date.localeCompare(a.date));
  const [lead, ...rest] = list;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-10 pt-28 md:px-8 md:pt-40">
      <Reveal>
        <p className="readout text-xs text-ink-faint">JOURNAL · {String(list.length).padStart(2, "0")}</p>
        <h1 className="display mt-4 text-[clamp(3rem,8vw,6.5rem)]">{t("title")}</h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-muted">{t("subtitle")}</p>
      </Reveal>

      <nav className="-mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0" aria-label={tp("categories")}>
        {[null, ...CATEGORIES].map((cat) => (
          <Link
            key={cat ?? "all"}
            href={cat ? `/blog?c=${cat}` : "/blog"}
            className={cn(
              "readout shrink-0 rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] ring-1 transition-colors",
              active === cat ? "bg-ink text-bg ring-ink" : "text-ink-muted ring-line hover:text-ink",
            )}
          >
            {cat ? tp(`postCategory.${cat}`) : tp("all")}
          </Link>
        ))}
      </nav>

      {lead && (
        <Reveal className="mt-12">
          <Link href={`/blog/${lead.slug}`} className="group grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
            <SkyPlate credit={false} image={lead.cover} seed={lead.slug} className="aspect-[16/10] rounded-3xl" priority sizes="(max-width: 768px) 100vw, 60vw" />
            <div className="pb-2">
              <p className="eyebrow">
                {tp(`postCategory.${lead.category}`)} · {lead.date} · {t("minutes", { count: lead.readingMinutes })}
              </p>
              <h2 className="display mt-4 text-4xl transition-colors group-hover:text-accent md:text-5xl">{pick(lead.title, locale)}</h2>
              <p className="mt-4 leading-relaxed text-ink-muted">{pick(lead.excerpt, locale)}</p>
              <span className="btn btn-ghost mt-8">{t("readMore")}</span>
            </div>
          </Link>
        </Reveal>
      )}

      <div className="mt-20 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 0.06}>
            <Link href={`/blog/${p.slug}`} className="group block">
              <SkyPlate credit={false} image={p.cover} seed={p.slug} className="aspect-[4/3] rounded-2xl" />
              <p className="eyebrow mt-5">
                {tp(`postCategory.${p.category}`)} · {t("minutes", { count: p.readingMinutes })}
              </p>
              <h3 className="display mt-3 text-2xl transition-colors group-hover:text-accent">{pick(p.title, locale)}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">{pick(p.excerpt, locale)}</p>
            </Link>
          </Reveal>
        ))}
      </div>
      {!list.length && <p className="mt-16 text-ink-faint">{tp("empty")}</p>}
    </div>
  );
}
