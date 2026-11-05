"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { PUBLISH_STATUSES, SERVICE_ICONS, serviceInput, type ServiceInput } from "@/lib/ops-schema";
import { createService, updateService } from "@/server/admin-ops-actions";
import { SERVICE_ICON_COMPONENTS } from "./service-icons";

const EMPTY: ServiceInput = {
  slug: "",
  icon: "telescope",
  title: { vi: "", en: "" },
  body: { vi: "", en: "" },
  fromVnd: 0,
  status: "draft",
};

export function ServiceForm({ initial, mode }: { initial?: ServiceInput; mode: "create" | "edit" }) {
  const t = useTranslations("adminops");
  const router = useRouter();
  const [v, setV] = useState<ServiceInput>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const Icon = SERVICE_ICON_COMPONENTS[v.icon];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!serviceInput.safeParse(v).success) return setError(t("common.invalid"));
    start(async () => {
      try {
        const res = mode === "create" ? await createService(v) : await updateService(v.slug, v);
        if (!res.ok) return setError(res.error === "SLUG_TAKEN" ? t("services.slugTaken") : t("common.invalid"));
        router.push("/admin/services");
        router.refresh();
      } catch {
        // Keep the typed values on a transient failure.
        setError(t("common.error"));
      }
    });
  };

  const l10nField = (key: "title" | "body", lang: "vi" | "en", label: string) => (
    <label className="block">
      <span className="eyebrow">{label}</span>
      {key === "title" ? (
        <input className="field mt-2" required maxLength={120} value={v.title[lang]} onChange={(e) => setV({ ...v, title: { ...v.title, [lang]: e.target.value } })} />
      ) : (
        <textarea className="field mt-2 min-h-28" required maxLength={2000} value={v.body[lang]} onChange={(e) => setV({ ...v, body: { ...v.body, [lang]: e.target.value } })} />
      )}
    </label>
  );

  return (
    <form onSubmit={submit} className="mt-8 max-w-3xl space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow">{t("services.slug")}</span>
          <input
            className="field readout mt-2 disabled:opacity-60"
            value={v.slug}
            disabled={mode === "edit"}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            onChange={(e) => setV({ ...v, slug: e.target.value.toLowerCase() })}
          />
          <span className="mt-1 block text-xs text-ink-faint">{t("services.slugHint")}</span>
        </label>
        <label className="block">
          <span className="eyebrow">{t("services.fromVnd")}</span>
          <input
            className="field readout mt-2"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            value={Number.isFinite(v.fromVnd) ? v.fromVnd : ""}
            onChange={(e) => setV({ ...v, fromVnd: e.target.valueAsNumber })}
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="block">
          <span className="eyebrow">{t("services.icon")}</span>
          <select className="field mt-2" value={v.icon} onChange={(e) => setV({ ...v, icon: e.target.value as ServiceInput["icon"] })}>
            {SERVICE_ICONS.map((i) => (
              <option key={i} value={i}>
                {t(`services.icons.${i}`)}
              </option>
            ))}
          </select>
        </label>
        <span className="grid size-14 place-items-center rounded-full ring-1 ring-line" role="img" aria-label={`${t("services.iconPreview")}: ${t(`services.icons.${v.icon}`)}`}>
          <Icon size={24} />
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {l10nField("title", "vi", t("services.titleVi"))}
        {l10nField("title", "en", t("services.titleEn"))}
        {l10nField("body", "vi", t("services.bodyVi"))}
        {l10nField("body", "en", t("services.bodyEn"))}
      </div>

      <label className="block max-w-xs">
        <span className="eyebrow">{t("common.status")}</span>
        <select className="field mt-2" value={v.status} onChange={(e) => setV({ ...v, status: e.target.value as ServiceInput["status"] })}>
          {PUBLISH_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`services.statuses.${s}`)}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? t("common.saving") : t("common.save")}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => router.push("/admin/services")}>
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
