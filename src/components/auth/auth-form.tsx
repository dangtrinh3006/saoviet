"use client";

import { ArrowRight } from "@/components/ui/icons";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { signIn, signUp } from "@/lib/auth-client";

// Only same-site relative paths are honoured, so ?next= cannot become an open redirect.
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const t = useTranslations("auth");
  const tx = useTranslations("authx.forgot");
  const tp = useTranslations("pages");
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const email = String(form.get("email") ?? "").trim();
        const password = String(form.get("password") ?? "");
        const name = String(form.get("name") ?? "").trim();
        setError(null);
        start(async () => {
          const res =
            mode === "sign-in"
              ? await signIn.email({ email, password })
              : await signUp.email({ email, password, name });
          if (res.error) return setError(res.error.message || t("error"));
          router.replace(next);
          router.refresh();
        });
      }}
    >
      {mode === "sign-up" && (
        <label className="block space-y-2">
          <span className="eyebrow">{t("name")}</span>
          <input name="name" className="field" autoComplete="name" minLength={2} maxLength={80} required />
        </label>
      )}
      <label className="block space-y-2">
        <span className="eyebrow">{t("email")}</span>
        <input name="email" type="email" className="field" autoComplete="email" required />
      </label>
      <label className="block space-y-2">
        <span className="eyebrow">{t("password")}</span>
        <input
          name="password"
          type="password"
          className="field"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          minLength={8}
          required
        />
        {mode === "sign-up" && <span className="block text-xs text-ink-faint">{tp("passwordHint")}</span>}
      </label>
      {mode === "sign-in" && (
        <p className="-mt-2 text-right text-sm">
          <Link href="/forgot-password" className="text-ink-muted underline-offset-4 hover:text-accent hover:underline">
            {tx("link")}
          </Link>
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full justify-center disabled:opacity-60">
        {pending ? tp("working") : mode === "sign-in" ? t("signIn") : t("signUp")} <ArrowRight size={16} />
      </button>
      <p className="text-center text-sm text-ink-muted">
        {mode === "sign-in" ? t("noAccount") : t("haveAccount")}{" "}
        <Link
          href={`/${mode === "sign-in" ? "sign-up" : "sign-in"}${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-accent underline-offset-4 hover:underline"
        >
          {mode === "sign-in" ? t("signUp") : t("signIn")}
        </Link>
      </p>
    </form>
  );
}
