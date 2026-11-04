"use client";

import { Eye, EyeOff } from "@/components/ui/icons";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { setHidden, setOrderStatus } from "@/server/actions";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: Status }) {
  const t = useTranslations("account");
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Status"
      className={cn("field !w-auto !py-2 text-sm", pending && "opacity-50")}
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as Status;
        start(async () => {
          await setOrderStatus(orderId, next);
          router.refresh();
        });
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {t(`status.${s}`)}
        </option>
      ))}
    </select>
  );
}

export function HideToggle({ kind, id, hidden }: { kind: "review" | "comment" | "thread"; id: string; hidden: boolean }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await setHidden(kind, id, !hidden);
          router.refresh();
        })
      }
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ring-1 transition-colors",
        hidden ? "text-aurora ring-aurora/40 hover:bg-aurora/10" : "text-danger ring-danger/40 hover:bg-danger/10",
        pending && "opacity-50",
      )}
    >
      {hidden ? <Eye size={13} /> : <EyeOff size={13} />} {hidden ? t("show") : t("hide")}
    </button>
  );
}
