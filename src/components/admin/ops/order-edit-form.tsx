"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { formatVnd } from "@/lib/l10n";
import { orderEditInput, orderTotal } from "@/lib/ops-schema";
import { updateOrder } from "@/server/admin-ops-actions";

type Values = {
  departureDate: string;
  guests: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  note: string;
  activityNote: string;
};

export function OrderEditForm({ id, unitPriceVnd, initial }: { id: string; unitPriceVnd: number; initial: Omit<Values, "activityNote"> }) {
  const t = useTranslations("adminops");
  const locale = useLocale();
  const router = useRouter();
  const [v, setV] = useState<Values>({ ...initial, activityNote: "" });
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const total = Number.isFinite(v.guests) ? orderTotal(unitPriceVnd, v.guests) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const input = { id, ...v };
    if (!orderEditInput.safeParse(input).success) return setNotice({ tone: "error", text: t("common.invalid") });
    start(async () => {
      try {
        const res = await updateOrder(input);
        if (!res.ok) return setNotice({ tone: "error", text: t("common.invalid") });
        // The server appended the activity line to the note; take its copy so the next save keeps it.
        setV((cur) => ({ ...cur, note: res.data?.note ?? cur.note, activityNote: "" }));
        setNotice({ tone: "ok", text: t("common.saved") });
        router.refresh();
      } catch {
        setNotice({ tone: "error", text: t("common.error") });
      }
    });
  };

  const text = (key: "contactName" | "contactEmail" | "contactPhone", type = "text") => (
    <label className="block">
      <span className="eyebrow">{t(`orders.${key}`)}</span>
      <input className="field mt-2" type={type} required value={v[key]} onChange={(e) => setV({ ...v, [key]: e.target.value })} />
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow">{t("orders.departure")}</span>
          <input className="field readout mt-2" type="date" required value={v.departureDate} onChange={(e) => setV({ ...v, departureDate: e.target.value })} />
        </label>
        <label className="block">
          <span className="eyebrow">{t("orders.guests")}</span>
          <input
            className="field readout mt-2"
            type="number"
            min={1}
            max={50}
            required
            value={Number.isFinite(v.guests) ? v.guests : ""}
            onChange={(e) => setV({ ...v, guests: e.target.valueAsNumber })}
          />
        </label>
      </div>
      <div className="card flex flex-wrap items-baseline justify-between gap-3 p-4">
        <span className="text-xs text-ink-muted">
          {t("orders.unitPrice")}: <span className="readout">{formatVnd(unitPriceVnd, locale)}</span>
        </span>
        <span>
          <span className="eyebrow mr-2">{t("orders.total")}</span>
          <output className="readout text-xl" data-testid="order-total">
            {total === null ? "—" : formatVnd(total, locale)}
          </output>
        </span>
        <span className="w-full text-xs text-ink-faint">{t("orders.totalHint")}</span>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {text("contactName")}
        {text("contactEmail", "email")}
        {text("contactPhone", "tel")}
      </div>
      <label className="block">
        <span className="eyebrow">{t("orders.note")}</span>
        <textarea className="field mt-2 min-h-32 text-sm" maxLength={4000} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} />
      </label>
      <label className="block">
        <span className="eyebrow">{t("orders.activityNote")}</span>
        <input className="field mt-2" maxLength={500} value={v.activityNote} onChange={(e) => setV({ ...v, activityNote: e.target.value })} />
        <span className="mt-1 block text-xs text-ink-faint">{t("orders.activityHint")}</span>
      </label>
      {notice && (
        <p role={notice.tone === "error" ? "alert" : "status"} className={notice.tone === "error" ? "text-sm text-danger" : "text-sm text-aurora"}>
          {notice.text}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? t("common.saving") : t("common.save")}
      </button>
    </form>
  );
}
