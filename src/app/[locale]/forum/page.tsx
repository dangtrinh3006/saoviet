import { MessageSquare, Pin, Plus } from "@/components/ui/icons";
import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { listThreads } from "@/server/queries";

const CATEGORIES = ["general", "gear", "trips", "photos"] as const;
type Category = (typeof CATEGORIES)[number];

export async function generateMetadata({ params }: PageProps<"/[locale]/forum">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forum" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ForumPage({ params, searchParams }: PageProps<"/[locale]/forum">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { c } = await searchParams;
  const t = await getTranslations("forum");
  const tp = await getTranslations("pages");
  const format = await getFormatter();
  const active = CATEGORIES.includes(c as Category) ? (c as Category) : undefined;
  const threads = await listThreads(active).catch(() => null);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-10 pt-28 md:px-8 md:pt-40">
      <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="readout text-xs text-ink-faint">FORUM · {String(threads?.length ?? 0).padStart(2, "0")}</p>
          <h1 className="display mt-4 text-[clamp(3rem,8vw,6rem)]">{t("title")}</h1>
          <p className="mt-5 max-w-xl text-lg text-ink-muted">{t("subtitle")}</p>
        </div>
        <Link href="/forum/new" className="btn btn-primary self-start md:self-auto">
          <Plus size={16} /> {t("newThread")}
        </Link>
      </Reveal>

      <nav className="-mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0" aria-label={t("category")}>
        {[undefined, ...CATEGORIES].map((cat) => (
          <Link
            key={cat ?? "all"}
            href={cat ? `/forum?c=${cat}` : "/forum"}
            className={cn(
              "readout shrink-0 rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] ring-1 transition-colors",
              active === cat ? "bg-ink text-bg ring-ink" : "text-ink-muted ring-line hover:text-ink",
            )}
          >
            {cat ? t(`categories.${cat}`) : tp("all")}
          </Link>
        ))}
      </nav>

      {threads === null ? (
        <p className="card mt-10 p-6 text-danger">{tp("dbUnavailable")}</p>
      ) : threads.length === 0 ? (
        <div className="card chart-grid mt-10 grid place-items-center p-16 text-center">
          <p className="text-ink-muted">{t("empty")}</p>
        </div>
      ) : (
        <ol className="mt-10 divide-y divide-line border-y hairline">
          {threads.map((th, i) => (
            <RevealItem key={th.id} delay={Math.min(i, 8) * 0.03}>
                <Link href={`/forum/${th.slug}`} className="group grid grid-cols-[auto_1fr_auto] items-start gap-4 py-6 md:gap-6">
                  <span className="readout pt-1.5 text-xs text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {th.pinned && (
                        <span className="readout inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase text-accent">
                          <Pin size={10} /> {tp("pinned")}
                        </span>
                      )}
                      <span className="eyebrow">{t(`categories.${th.category as Category}`)}</span>
                    </div>
                    <h2 className="display mt-2 text-xl transition-colors group-hover:text-accent md:text-2xl">{th.title}</h2>
                    <p className="mt-2 text-xs text-ink-faint">
                      {th.author.name} · {format.relativeTime(th.createdAt)}
                    </p>
                  </div>
                  <span className="readout flex items-center gap-1.5 pt-1.5 text-sm text-ink-muted">
                    <MessageSquare size={14} aria-hidden /> <span aria-hidden>{th.replies}</span>
                    <span className="sr-only">{t("replies", { count: th.replies })}</span>
                  </span>
                </Link>
              </RevealItem>
          ))}
        </ol>
      )}
    </div>
  );
}
