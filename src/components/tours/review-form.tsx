"use client";

import { Star } from "@/components/ui/icons";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import { upsertReview } from "@/server/actions";

export function ReviewForm({ tourSlug }: { tourSlug: string }) {
  const t = useTranslations("tours");
  const ta = useTranslations("nav");
  const tc = useTranslations("common");
  const router = useRouter();
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!session) {
    return (
      <Link href={`/sign-in?next=/tours/${tourSlug}`} className="btn btn-ghost">
        {ta("signIn")} · {t("writeReview")}
      </Link>
    );
  }

  return (
    <form
      className="card space-y-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await upsertReview({ tourSlug, rating, body });
          if (!res.ok) return setError(`${tc("error")} (${res.error})`);
          setBody("");
          setError(null);
          router.refresh();
        });
      }}
    >
      <p className="eyebrow">{t("writeReview")}</p>
      <div className="flex gap-1" role="radiogroup" aria-label={t("rating")}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n}`} onClick={() => setRating(n)} className="p-1">
            <Star size={22} className={cn(n <= rating ? "fill-accent text-accent" : "text-ink-faint")} />
          </button>
        ))}
      </div>
      <textarea className="field min-h-24" required minLength={10} aria-label={t("writeReview")} value={body} onChange={(e) => setBody(e.target.value)} />
      <div className="flex items-center justify-between">
        {error ? <p className="text-sm text-danger">{error}</p> : <span />}
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {tc("save")}
        </button>
      </div>
    </form>
  );
}
