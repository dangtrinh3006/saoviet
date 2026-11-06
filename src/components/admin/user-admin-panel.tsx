"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import type { Role } from "@/lib/admin-guards";
import { cn } from "@/lib/cn";
import { adminSetBan, adminSetRole, type UserActionResult } from "@/server/admin-user-actions";

type Pending = "role" | "ban" | null;

const chip = "inline-flex shrink-0 items-center rounded-full px-3.5 py-2 text-sm ring-1 transition-colors disabled:opacity-50";

export function UserAdminPanel({ userId, role, banned, banReason }: { userId: string; role: Role; banned: boolean; banReason: string | null }) {
  const t = useTranslations("adminusers");
  const router = useRouter();
  const [busy, start] = useTransition();
  const [confirming, setConfirming] = useState<Pending>(null);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const report = (res: UserActionResult) => {
    setNotice(res.ok ? { ok: true, text: t("done") } : { ok: false, text: t(`errors.${res.error}`) });
    if (res.ok) {
      setReason("");
      router.refresh();
    }
  };

  const run = (action: Exclude<Pending, null>) =>
    start(async () => {
      setConfirming(null);
      setNotice(null);
      try {
        report(action === "role" ? await adminSetRole(userId, role === "admin" ? "user" : "admin") : await adminSetBan(userId, !banned, reason));
      } catch {
        setNotice({ ok: false, text: t("errors.FAILED") });
      }
    });

  const confirmRow = (action: Exclude<Pending, null>, label: string) => (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="text-sm text-ink-muted">{label}?</span>
      <button type="button" disabled={busy} onClick={() => run(action)} className={cn(chip, "text-danger ring-danger/40 hover:bg-danger/10")}>
        {t("confirm")}
      </button>
      <button type="button" disabled={busy} onClick={() => setConfirming(null)} className={cn(chip, "text-ink-muted ring-line hover:bg-surface")}>
        {t("cancel")}
      </button>
    </div>
  );

  const roleLabel = role === "admin" ? t("role.makeUser") : t("role.makeAdmin");
  const banLabel = banned ? t("ban.unban") : t("ban.ban");

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <section className="rounded-2xl p-5 ring-1 ring-line">
        <h2 className="eyebrow">{t("role.title")}</h2>
        <p className={cn("mt-2 text-lg", role === "admin" && "text-accent")}>{t(`role.${role}`)}</p>
        <div className="mt-4">
          {confirming === "role" ? (
            confirmRow("role", roleLabel)
          ) : (
            <button type="button" disabled={busy} onClick={() => setConfirming("role")} className={cn(chip, "text-ink ring-line hover:bg-surface")}>
              {roleLabel}
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl p-5 ring-1 ring-line">
        <h2 className="eyebrow">{t("ban.title")}</h2>
        <p className={cn("mt-2 text-lg", banned && "text-danger")}>{banned ? t("ban.banned") : t("ban.active")}</p>
        {banned && banReason && <p className="mt-1 text-sm text-ink-muted">{t("ban.reason", { reason: banReason })}</p>}
        {!banned && (
          <label className="mt-4 block space-y-2">
            <span className="text-xs text-ink-faint">{t("ban.reasonLabel")}</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} className="field" />
          </label>
        )}
        <div className="mt-4">
          {confirming === "ban" ? (
            confirmRow("ban", banLabel)
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirming("ban")}
              className={cn(chip, banned ? "text-ink ring-line hover:bg-surface" : "text-danger ring-danger/40 hover:bg-danger/10")}
            >
              {banLabel}
            </button>
          )}
        </div>
        {!banned && <p className="mt-3 text-xs text-ink-faint">{t("ban.note")}</p>}
      </section>

      {notice && (
        <p role={notice.ok ? "status" : "alert"} className={cn("text-sm sm:col-span-2", notice.ok ? "text-accent" : "text-danger")}>
          {notice.text}
        </p>
      )}
    </div>
  );
}
