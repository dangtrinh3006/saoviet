"use client";

import { ArrowRight } from "@/components/ui/icons";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import { newPasswordError } from "@/lib/password-check";
import { safeNext } from "@/lib/safe-next";
import { PasswordInput } from "@/components/ui/password-input";

export function AuthForm({ mode, google = false }: { mode: "sign-in" | "sign-up"; google?: boolean }) {
  const t = useTranslations("auth");
  const tx = useTranslations("authx.forgot");
  const tp = useTranslations("pages");
  const ts = useTranslations("authx.social");
  const tf = useTranslations("authx.field");
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  // Better Auth sends OAuth failures back here as ?error=<code>.
  const [error, setError] = useState<string | null>(params.get("error") ? ts("failed") : null);
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
        if (mode === "sign-up") {
          const invalid = newPasswordError(password, String(form.get("confirmPassword") ?? ""));
          if (invalid) return setError(tf(invalid));
        }
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
      {google && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setError(null);
              start(async () => {
                const res = await signIn.social({
                  provider: "google",
                  callbackURL: `/${locale}${next}`,
                  errorCallbackURL: `/${locale}/${mode}?next=${encodeURIComponent(next)}`,
                });
                if (res?.error) setError(ts("failed"));
              });
            }}
            className="btn btn-ghost w-full justify-center gap-3 disabled:opacity-60"
          >
            <GoogleMark /> {ts("google")}
          </button>
          <p className="flex items-center gap-3 text-xs uppercase tracking-widest text-ink-faint" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            {ts("or")}
            <span className="h-px flex-1 bg-line" />
          </p>
        </>
      )}
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
        <PasswordInput name="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={8} required />
        {mode === "sign-up" && <span className="block text-xs text-ink-faint">{tp("passwordHint")}</span>}
      </label>
      {mode === "sign-up" && (
        <label className="block space-y-2">
          <span className="eyebrow">{tf("confirm")}</span>
          <PasswordInput name="confirmPassword" autoComplete="new-password" minLength={8} required />
        </label>
      )}
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
          className="text-accent underline underline-offset-4"
        >
          {mode === "sign-in" ? t("signUp") : t("signIn")}
        </Link>
      </p>
    </form>
  );
}

/** Official multicolour "G" mark, as Google's sign-in branding guidelines require. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
