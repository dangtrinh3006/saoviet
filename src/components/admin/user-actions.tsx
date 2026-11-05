"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { adminRevokeSessions, adminSendResetEmail, adminSetTempPassword } from "@/server/admin-actions";

type Notice = { tone: "ok" | "error"; text: string } | null;
type Pending = "reset-email" | "temp-password" | "revoke" | null;

const chip = "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs ring-1 transition-colors disabled:opacity-50";

export function UserActions({ userId, userEmail }: { userId: string; userEmail: string }) {
  const t = useTranslations("authx.admin");
  const locale = useLocale();
  const [busy, start] = useTransition();
  const [confirming, setConfirming] = useState<Pending>(null);
  const [notice, setNotice] = useState<Notice>(null);
  // Held only in component state: gone on refresh, never sent anywhere else.
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const run = (action: Exclude<Pending, null>) =>
    start(async () => {
      setConfirming(null);
      setNotice(null);
      setTempPassword(null);
      try {
        if (action === "reset-email") {
          const res = await adminSendResetEmail(userId, locale);
          setNotice(res.ok ? { tone: "ok", text: t("resetEmailSent") } : { tone: "error", text: t("error") });
        } else if (action === "temp-password") {
          const res = await adminSetTempPassword(userId);
          if (res.ok && res.data) setTempPassword(res.data.password);
          else setNotice({ tone: "error", text: t("error") });
        } else {
          const res = await adminRevokeSessions(userId);
          setNotice(res.ok ? { tone: "ok", text: t("sessionsRevoked") } : { tone: "error", text: t("error") });
        }
      } catch {
        setNotice({ tone: "error", text: t("error") });
      }
    });

  const labels: Record<Exclude<Pending, null>, string> = {
    "reset-email": t("sendResetEmail"),
    "temp-password": t("setTempPassword"),
    revoke: t("revokeSessions"),
  };

  return (
    <div className="col-start-2 min-w-0 space-y-3 sm:col-span-3">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`${labels[confirming]} · ${userEmail}`}>
          <span className="text-xs text-ink-muted">{labels[confirming]}?</span>
          <button type="button" disabled={busy} onClick={() => run(confirming)} className={cn(chip, "text-danger ring-danger/40 hover:bg-danger/10")}>
            {t("confirm")}
          </button>
          <button type="button" disabled={busy} onClick={() => setConfirming(null)} className={cn(chip, "text-ink-muted ring-line hover:bg-surface")}>
            {t("cancel")}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1">{t("resetPassword")}</span>
          <button type="button" disabled={busy} onClick={() => setConfirming("reset-email")} className={cn(chip, "text-ink ring-line hover:bg-surface")}>
            {labels["reset-email"]}
          </button>
          <button type="button" disabled={busy} onClick={() => setConfirming("temp-password")} className={cn(chip, "text-ink ring-line hover:bg-surface")}>
            {labels["temp-password"]}
          </button>
          <button type="button" disabled={busy} onClick={() => setConfirming("revoke")} className={cn(chip, "text-danger ring-danger/40 hover:bg-danger/10")}>
            {labels.revoke}
          </button>
        </div>
      )}
      {notice && (
        <p role={notice.tone === "error" ? "alert" : "status"} className={cn("text-xs", notice.tone === "error" ? "text-danger" : "text-accent")}>
          {notice.text}
        </p>
      )}
      {tempPassword && (
        <div role="status" className="card space-y-2 p-4">
          <p className="eyebrow">{t("tempPasswordLabel")}</p>
          <output data-testid="temp-password" className="readout block select-all break-all text-lg">
            {tempPassword}
          </output>
          <p className="text-xs text-ink-muted">{t("tempPasswordNote")}</p>
        </div>
      )}
    </div>
  );
}
