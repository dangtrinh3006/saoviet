import { getFormatter, getTranslations } from "next-intl/server";

type CommentRow = { id: string; body: string; createdAt: Date; author: { name: string; image: string | null } };

export async function CommentList({ comments }: { comments: CommentRow[] }) {
  const t = await getTranslations("pages");
  const format = await getFormatter();
  if (!comments.length) return <p className="py-6 text-ink-faint">{t("noComments")}</p>;
  return (
    <ol className="divide-y divide-line border-y hairline">
      {comments.map((c, i) => (
        <li key={c.id} className="flex gap-4 py-6">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-sm ring-1 ring-line">
            {c.author.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-medium">{c.author.name}</span>
              <time className="readout text-xs text-ink-faint" dateTime={c.createdAt.toISOString()}>
                {format.dateTime(c.createdAt, { dateStyle: "medium", timeStyle: "short" })}
              </time>
              <span className="readout ml-auto text-xs text-ink-faint">#{String(i + 1).padStart(2, "0")}</span>
            </div>
            <p className="mt-2 whitespace-pre-line break-words leading-relaxed text-ink-muted">{c.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
