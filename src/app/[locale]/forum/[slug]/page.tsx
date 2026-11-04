import { ArrowLeft } from "@/components/ui/icons";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { CommentForm } from "@/components/community/comment-form";
import { CommentList } from "@/components/community/comment-list";
import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";
import { commentsFor, threadBySlug } from "@/server/queries";

const CATEGORIES = ["general", "gear", "trips", "photos"] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]/forum/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const row = await threadBySlug(slug).catch(() => null);
  return row ? { title: row.thread.title, description: row.thread.body.slice(0, 150) } : {};
}

export default async function ThreadPage({ params }: PageProps<"/[locale]/forum/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const row = await threadBySlug(slug);
  if (!row) notFound();
  const t = await getTranslations("forum");
  const format = await getFormatter();
  const replies = await commentsFor("thread", slug);
  const { thread, author } = row;
  const category = CATEGORIES.find((c) => c === thread.category) ?? "general";

  return (
    <article className="mx-auto max-w-3xl px-5 pb-10 pt-28 md:px-8 md:pt-36">
      <Link href="/forum" className="eyebrow inline-flex items-center gap-2 hover:text-ink">
        <ArrowLeft size={14} /> {t("title")}
      </Link>
      <Reveal>
        <p className="eyebrow mt-10">{t(`categories.${category}`)}</p>
        <h1 className="display mt-4 text-[clamp(2.2rem,6vw,4rem)]">{thread.title}</h1>
        <div className="mt-6 flex items-center gap-3 border-b hairline pb-8">
          <span className="grid size-10 place-items-center rounded-full bg-accent font-semibold text-accent-ink">
            {author.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="font-medium">{author.name}</p>
            <time className="readout text-xs text-ink-faint" dateTime={thread.createdAt.toISOString()}>
              {format.dateTime(thread.createdAt, { dateStyle: "long", timeStyle: "short" })}
            </time>
          </div>
        </div>
        <p className="mt-8 whitespace-pre-line break-words text-lg leading-relaxed text-ink-muted">{thread.body}</p>
      </Reveal>

      <section className="mt-20" aria-labelledby="replies">
        <div className="flex items-baseline justify-between border-t hairline pt-6">
          <h2 id="replies" className="display text-3xl">
            {t("replies", { count: replies.length })}
          </h2>
          <span className="readout text-sm text-ink-faint">{String(replies.length).padStart(2, "0")}</span>
        </div>
        <div className="mt-6">
          <CommentList comments={replies} />
        </div>
        <div className="mt-8">
          <CommentForm targetType="thread" targetId={slug} returnTo={`/forum/${slug}`} />
        </div>
      </section>
    </article>
  );
}
