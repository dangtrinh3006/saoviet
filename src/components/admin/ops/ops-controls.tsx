"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Trash } from "@/components/ui/icons";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/ops-schema";
import { deleteOrder, moveService, resolveChangeRequest, setOrderStatusOps } from "@/server/admin-ops-actions";

const chip = "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ring-1 transition-colors disabled:opacity-40";

export function ServiceMove({ slug, name, first, last }: { slug: string; name: string; first: boolean; last: boolean }) {
  const t = useTranslations("adminops.services");
  const router = useRouter();
  const [pending, start] = useTransition();
  const move = (dir: "up" | "down") =>
    start(async () => {
      await moveService(slug, dir);
      router.refresh();
    });
  return (
    <span className="inline-flex gap-1">
      <button type="button" className={cn(chip, "ring-line hover:bg-surface")} disabled={first || pending} onClick={() => move("up")} aria-label={t("moveUp", { name })}>
        <ArrowUp size={13} />
      </button>
      <button type="button" className={cn(chip, "ring-line hover:bg-surface")} disabled={last || pending} onClick={() => move("down")} aria-label={t("moveDown", { name })}>
        <ArrowDown size={13} />
      </button>
    </span>
  );
}

export function OrderStatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const t = useTranslations("account");
  const tc = useTranslations("adminops.common");
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();
  return (
    <span className="inline-flex flex-col gap-1">
      <select
        aria-label={tc("status")}
        className={cn("field !w-auto !py-2 text-sm", pending && "opacity-50")}
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as OrderStatus;
          const prev = value;
          setValue(next);
          setFailed(false);
          start(async () => {
            const res = await setOrderStatusOps(orderId, next).catch(() => null);
            if (!res?.ok) {
              setValue(prev);
              setFailed(true);
            }
            router.refresh();
          });
        }}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {t(`status.${s}`)}
          </option>
        ))}
      </select>
      {failed && (
        <span role="alert" className="text-xs text-danger">
          {tc("error")}
        </span>
      )}
    </span>
  );
}

/** Two-step delete: the first click arms it, no browser dialog. */
export function OrderDelete({ orderId, code, redirectTo }: { orderId: string; code: string; redirectTo?: string }) {
  const t = useTranslations("adminops.common");
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();
  if (!armed)
    return (
      <button type="button" className={cn(chip, "text-danger ring-danger/40 hover:bg-danger/10")} onClick={() => setArmed(true)} aria-label={`${t("delete")} ${code}`}>
        <Trash size={13} /> {t("delete")}
      </button>
    );
  return (
    <span className="inline-flex flex-wrap items-center gap-2" role="group" aria-label={`${t("delete")} ${code}`}>
      <button
        type="button"
        disabled={pending}
        className={cn(chip, "bg-danger/10 text-danger ring-danger/60")}
        onClick={() =>
          start(async () => {
            setFailed(false);
            const res = await deleteOrder(orderId).catch(() => null);
            if (!res?.ok) return setFailed(true);
            if (redirectTo) router.push(redirectTo);
            router.refresh();
          })
        }
      >
        {t("confirmDelete")}
      </button>
      <button type="button" disabled={pending} className={cn(chip, "text-ink-muted ring-line hover:bg-surface")} onClick={() => setArmed(false)}>
        {t("cancel")}
      </button>
      {failed && (
        <span role="alert" className="text-xs text-danger">
          {t("error")}
        </span>
      )}
    </span>
  );
}

export function ChangeRequestActions({ id, status, note }: { id: string; status: string; note: string | null }) {
  const t = useTranslations("adminops.queue");
  const tc = useTranslations("adminops.common");
  const router = useRouter();
  const [text, setText] = useState(note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const act = (next: "in_progress" | "done" | "rejected") => {
    setError(null);
    if (next === "rejected" && !text.trim()) return setError(t("noteRequired"));
    start(async () => {
      const res = await resolveChangeRequest({ id, status: next, resolutionNote: text }).catch(() => null);
      if (!res?.ok) return setError(res?.error === "NOTE_REQUIRED" ? t("noteRequired") : tc("error"));
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="eyebrow">{t("resolutionNote")}</span>
        <textarea className="field mt-2 min-h-24" maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} />
        <span className="mt-1 block text-xs text-ink-faint">{t("resolutionHint")}</span>
      </label>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost" disabled={pending || status === "in_progress"} onClick={() => act("in_progress")}>
          {t("markInProgress")}
        </button>
        <button type="button" className="btn btn-primary" disabled={pending || status === "done"} onClick={() => act("done")}>
          {t("markDone")}
        </button>
        <button type="button" className="btn btn-ghost text-danger" disabled={pending || status === "rejected"} onClick={() => act("rejected")}>
          {t("markRejected")}
        </button>
      </div>
    </div>
  );
}
