"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { createThread } from "@/server/actions";

const CATEGORIES = ["general", "gear", "trips", "photos"] as const;

export function ThreadForm() {
  const t = useTranslations("forum");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const router = useRouter();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await createThread({ title, body, category });
          // Keep the draft on failure so a transient error never costs the user their text.
          if (!res.ok) return setError(res.error === "UNAUTHENTICATED" ? tp("signInToComment") : tp("threadError"));
          router.push(`/forum/${res.data!.slug}`);
        });
      }}
    >
      <fieldset>
        <legend className="eyebrow mb-3">{t("category")}</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-4 py-2 text-sm ring-1 transition-colors",
                category === c ? "bg-ink text-bg ring-ink" : "text-ink-muted ring-line hover:text-ink",
              )}
            >
              {t(`categories.${c}`)}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block space-y-2">
        <span className="eyebrow">{t("threadTitle")}</span>
        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} minLength={6} maxLength={140} required />
      </label>
      <label className="block space-y-2">
        <span className="eyebrow">{t("threadBody")}</span>
        <textarea className="field min-h-56 resize-y" value={body} onChange={(e) => setBody(e.target.value)} minLength={10} maxLength={5000} required />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" className="btn btn-ghost" onClick={() => router.push("/forum")}>
          {tc("cancel")}
        </button>
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-50">
          {pending ? tc("loading") : t("submit")}
        </button>
      </div>
    </form>
  );
}
