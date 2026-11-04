import { ArrowLeft } from "@/components/ui/icons";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { RichText } from "@/components/blog/rich-text";
import { CommentForm } from "@/components/community/comment-form";
import { CommentList } from "@/components/community/comment-list";
import { Reveal } from "@/components/ui/reveal";
import { SkyPlate } from "@/components/ui/sky-plate";
import { postBySlug, posts } from "@/content/posts";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { pick } from "@/lib/l10n";
import { commentsFor } from "@/server/queries";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = postBySlug(slug);
  if (!post) return {};
  return {
    title: pick(post.title, locale),
    description: pick(post.excerpt, locale),
    alternates: { languages: { vi: `/vi/blog/${slug}`, en: `/en/blog/${slug}` } },
    openGraph: { type: "article", publishedTime: post.date },
  };
}

export default async function PostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = postBySlug(slug);
  if (!post) notFound();
  const t = await getTranslations("blog");
  const tp = await getTranslations("pages");
  // A DB outage must not take the article down; comments simply render empty.
  const comments = await commentsFor("post", slug).catch(() => []);
  const others = posts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <article className="pb-10 pt-24 md:pt-32">
      <ReadingProgress />
      <header className="mx-auto max-w-4xl px-5 md:px-8">
        <Link href="/blog" className="eyebrow inline-flex items-center gap-2 hover:text-ink">
          <ArrowLeft size={14} /> {t("title")}
        </Link>
        <Reveal>
          <p className="eyebrow mt-10">
            {tp(`postCategory.${post.category}`)} · <time dateTime={post.date}>{post.date}</time> · {t("minutes", { count: post.readingMinutes })}
          </p>
          <h1 className="display mt-5 text-[clamp(2.6rem,7vw,5.2rem)]">{pick(post.title, locale)}</h1>
          <p className="mt-6 text-xl leading-relaxed text-ink-muted">{pick(post.excerpt, locale)}</p>
        </Reveal>
      </header>

      <Reveal className="mx-auto mt-12 max-w-6xl px-5 md:px-8">
        <SkyPlate image={post.cover} seed={post.slug} className="aspect-[16/9] rounded-3xl" priority sizes="(max-width: 1200px) 100vw, 1150px" />
        {post.cover.license !== "TBD" && (
          <p className="readout mt-3 text-xs text-ink-faint">
            {post.cover.credit} · {post.cover.license}
          </p>
        )}
      </Reveal>

      <div className="mx-auto mt-16 max-w-2xl px-5 md:px-0">
        <RichText body={pick(post.body, locale)} />
      </div>

      <section className="mx-auto mt-24 max-w-2xl px-5 md:px-0" aria-labelledby="comments">
        <div className="flex items-baseline justify-between border-t hairline pt-6">
          <h2 id="comments" className="display text-3xl">
            {t("comments")}
          </h2>
          <span className="readout text-sm text-ink-faint">{String(comments.length).padStart(2, "0")}</span>
        </div>
        <div className="mt-6">
          <CommentList comments={comments} />
        </div>
        <div className="mt-8">
          <CommentForm targetType="post" targetId={slug} returnTo={`/blog/${slug}`} />
        </div>
      </section>

      {others.length > 0 && (
        <aside className="mx-auto mt-28 max-w-6xl px-5 md:px-8">
          <p className="eyebrow border-t hairline pt-6">{tp("keepReading")}</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {others.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex gap-5">
                <SkyPlate credit={false} image={p.cover} seed={p.slug} className="aspect-square w-28 shrink-0 rounded-xl" sizes="112px" />
                <div>
                  <h3 className="display text-xl transition-colors group-hover:text-accent">{pick(p.title, locale)}</h3>
                  <p className="eyebrow mt-2">
                    {t("minutes", { count: p.readingMinutes })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </article>
  );
}
