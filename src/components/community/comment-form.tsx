"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSession } from "@/lib/auth-client";
import { addComment } from "@/server/actions";

export function CommentForm({ targetType, targetId, returnTo }: { targetType: "post" | "thread"; targetId: string; returnTo: string }) {
  const t = useTranslations("pages");
  const tc = useTranslations("common");
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (isPending) return <div className="h-32 animate-pulse rounded-2xl bg-surface" />;
  if (!session) {
    return (
      <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-ink-muted">{t("signInToComment")}</p>
        <Link href={`/sign-in?next=${encodeURIComponent(returnTo)}`} className="btn btn-primary">
          {t("signInCta")}
        </Link>
      </div>
    );
  }

  return (
    <form
      className="card space-y-4 p-5 md:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await addComment({ targetType, targetId, body });
          if (!res.ok) return setError(t("commentError"));
          setBody("");
          router.refresh();
        });
      }}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-ink">
          {session.user.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="text-sm text-ink-muted">{session.user.name}</span>
      </div>
      <label className="sr-only" htmlFor={`c-${targetId}`}>
        {t("commentPlaceholder")}
      </label>
      <textarea
        id={`c-${targetId}`}
        className="field min-h-28 resize-y"
        placeholder={t("commentPlaceholder")}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        minLength={2}
        maxLength={2000}
        required
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={pending || body.trim().length < 2} className="btn btn-primary disabled:opacity-50">
          {pending ? tc("loading") : t("send")}
        </button>
      </div>
    </form>
  );
}
