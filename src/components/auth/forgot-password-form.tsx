"use client";

import { ArrowRight } from "@/components/ui/icons";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const t = useTranslations("authx.forgot");
  const ta = useTranslations("auth");
  const tp = useTranslations("pages");
  const locale = useLocale();
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  if (sent) {
    return (
      <div className="space-y-6">
        <p role="status" className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-ink">
          {t("sent")}
        </p>
        <Link href="/sign-in" className="btn btn-ghost">
          {t("back")}
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
        start(async () => {
          // The outcome is deliberately ignored: one neutral message, whether the account exists or not.
          await authClient.requestPasswordReset({ email, redirectTo: `/${locale}/reset-password` }).catch(() => null);
          setSent(true);
        });
      }}
    >
      <label className="block space-y-2">
        <span className="eyebrow">{ta("email")}</span>
        <input name="email" type="email" className="field" autoComplete="email" required />
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary w-full justify-center disabled:opacity-60">
        {pending ? tp("working") : t("submit")} <ArrowRight size={16} />
      </button>
      <p className="text-center text-sm">
        <Link href="/sign-in" className="text-accent underline-offset-4 hover:underline">
          {t("back")}
        </Link>
      </p>
    </form>
  );
}
