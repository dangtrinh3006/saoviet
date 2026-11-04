"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { cancelMyOrder } from "@/server/actions";

// Two-step inline confirm instead of window.confirm, which blocks the page.
export function CancelOrderButton({ orderId }: { orderId: string }) {
  const t = useTranslations("pages");
  const tc = useTranslations("common");
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();

  if (!armed) {
    return (
      <button type="button" className="text-sm text-ink-muted underline-offset-4 hover:text-danger hover:underline" onClick={() => setArmed(true)}>
        {t("cancelOrder")}
      </button>
    );
  }
  return (
    <span className="flex items-center gap-3 text-sm">
      <button
        type="button"
        disabled={pending}
        className="text-danger underline underline-offset-4"
        onClick={() =>
          start(async () => {
            await cancelMyOrder(orderId);
            router.refresh();
          })
        }
      >
        {pending ? tc("loading") : t("confirmCancel")}
      </button>
      <button type="button" className="text-ink-muted" onClick={() => setArmed(false)}>
        {tc("back")}
      </button>
    </span>
  );
}
