"use client";

import { ArrowRight } from "@/components/ui/icons";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

const MIN_LENGTH = 8;

export function ResetPasswordForm({ token }: { token: string | null }) {
  const t = useTranslations("authx.reset");
  const tp = useTranslations("pages");
  const [error, setError] = useState<string | null>(token ? null : t("invalidToken"));
  const [tokenInvalid, setTokenInvalid] = useState(!token);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (done) {
    return (
      <div className="space-y-6">
        <p role="status" className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-ink">
          {t("success")}
        </p>
        <Link href="/sign-in" className="btn btn-primary">
          {t("goSignIn")} <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (tokenInvalid || !token) {
    return (
      <div className="space-y-6">
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error ?? t("invalidToken")}
        </p>
        <Link href="/forgot-password" className="btn btn-ghost">
          {t("requestNew")}
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const newPassword = String(form.get("newPassword") ?? "");
        const confirm = String(form.get("confirmPassword") ?? "");
        if (newPassword.length < MIN_LENGTH) return setError(t("tooShort"));
        if (newPassword !== confirm) return setError(t("mismatch"));
        setError(null);
        start(async () => {
          const res = await authClient.resetPassword({ newPassword, token });
          if (!res.error) return setDone(true);
          if (res.error.code === "INVALID_TOKEN") {
            setTokenInvalid(true);
            return setError(t("invalidToken"));
          }
          if (res.error.code === "PASSWORD_TOO_SHORT") return setError(t("tooShort"));
          setError(t("error"));
        });
      }}
    >
      <label className="block space-y-2">
        <span className="eyebrow">{t("newPassword")}</span>
        <input name="newPassword" type="password" className="field" autoComplete="new-password" minLength={MIN_LENGTH} required />
      </label>
      <label className="block space-y-2">
        <span className="eyebrow">{t("confirmPassword")}</span>
        <input name="confirmPassword" type="password" className="field" autoComplete="new-password" minLength={MIN_LENGTH} required />
        <span className="block text-xs text-ink-faint">{tp("passwordHint")}</span>
      </label>
      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full justify-center disabled:opacity-60">
        {pending ? tp("working") : t("submit")} <ArrowRight size={16} />
      </button>
    </form>
  );
}
