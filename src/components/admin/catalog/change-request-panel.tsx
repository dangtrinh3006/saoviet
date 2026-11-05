"use client";

import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { CheckCircle2, Loader2, MapPinPlus, X } from "@/components/ui/icons";
import {
  CHANGE_KINDS,
  type ChangeKind,
  type ChangeRequestFormValues,
  changeRequestFormToInput,
  emptyChangeRequest,
  type FieldErrors,
  parseChangeRequest,
} from "@/lib/catalog-schema";
import { cn } from "@/lib/cn";
import { createChangeRequest } from "@/server/admin-catalog-actions";

/** Not a <form>: it lives inside the tour form, and nested forms are invalid HTML. */
export function ChangeRequestPanel({ tourSlug }: { tourSlug?: string }) {
  const t = useTranslations("admincatalog");
  const id = useId();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ChangeRequestFormValues>(() => emptyChangeRequest(tourSlug));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();

  const set = (key: "title" | "details", v: string) => {
    setValues((s) => ({ ...s, [key]: v }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };
  const setLoc = (key: keyof ChangeRequestFormValues["location"], v: string) => {
    setValues((s) => ({ ...s, location: { ...s.location, [key]: v } }));
    setErrors((e) => ({ ...e, [`location.${key}`]: "" }));
  };
  const err = (path: string) =>
    errors[path] ? (
      <p id={`${id}-${path}-err`} className="mt-1 text-xs text-danger">
        {t(t.has(`errors.${errors[path]}`) ? `errors.${errors[path]}` : "errors.invalid")}
      </p>
    ) : null;
  const fieldCls = (path: string) => cn("field !py-2 text-sm", errors[path] && "border-danger");
  const aria = (path: string) => ({
    id: `${id}-${path}`,
    "aria-invalid": errors[path] ? true : undefined,
    "aria-describedby": errors[path] ? `${id}-${path}-err` : undefined,
  });

  function submit() {
    setFailed(false);
    const input = changeRequestFormToInput(values);
    const parsed = parseChangeRequest(input);
    if (!parsed.ok) return setErrors(parsed.errors);
    start(async () => {
      const res = await createChangeRequest(input).catch(() => ({ ok: false as const, error: "FAILED" as const, fieldErrors: undefined }));
      if (!res.ok) {
        if (res.fieldErrors) setErrors(res.fieldErrors);
        else setFailed(true);
        return;
      }
      setSent(true);
      setValues(emptyChangeRequest(tourSlug));
    });
  }

  if (!open) {
    return (
      <button type="button" className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline" onClick={() => setOpen(true)} aria-expanded={false}>
        <MapPinPlus size={15} /> {t("request.open")}
      </button>
    );
  }

  return (
    <section
      aria-labelledby={`${id}-h`}
      className="card mt-3 space-y-4 p-4 md:p-5"
      // Enter in these inputs must not submit the surrounding tour form.
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement) e.preventDefault();
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id={`${id}-h`} className="eyebrow !text-ink">
            {t("request.heading")}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{t("request.intro")}</p>
        </div>
        <button type="button" className="grid size-8 shrink-0 place-items-center rounded-full ring-1 ring-line hover:ring-ink" aria-label={t("request.close")} onClick={() => setOpen(false)}>
          <X size={14} />
        </button>
      </div>

      {sent ? (
        <div role="status" className="flex flex-col items-start gap-3">
          <p className="flex items-start gap-2 text-sm text-aurora">
            <CheckCircle2 size={18} /> {t("request.success")}
          </p>
          <button type="button" className="btn btn-ghost !py-2 text-xs" onClick={() => setSent(false)}>
            {t("request.another")}
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
            <div>
              <label htmlFor={`${id}-kind`} className="eyebrow mb-1.5 block">
                {t("request.kind")}
              </label>
              <select
                id={`${id}-kind`}
                className="field !py-2 text-sm"
                value={values.kind}
                onChange={(e) => {
                  setValues((s) => ({ ...s, kind: e.target.value as ChangeKind }));
                  setErrors({});
                }}
              >
                {CHANGE_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(`request.kinds.${k}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-title`} className="eyebrow mb-1.5 block">
                {t("request.title")}
              </label>
              <input {...aria("title")} className={fieldCls("title")} maxLength={160} value={values.title} onChange={(e) => set("title", e.target.value)} />
              {err("title")}
            </div>
          </div>

          {values.kind === "location" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(["nameVi", "nameEn", "lat", "lng"] as const).map((k) => (
                <div key={k}>
                  <label htmlFor={`${id}-location.${k}`} className="eyebrow mb-1.5 block">
                    {t(`request.${k}`)}
                  </label>
                  <input
                    {...aria(`location.${k}`)}
                    className={cn(fieldCls(`location.${k}`), (k === "lat" || k === "lng") && "readout")}
                    inputMode={k === "lat" || k === "lng" ? "decimal" : undefined}
                    placeholder={k === "lat" ? "21.33" : k === "lng" ? "104.48" : undefined}
                    maxLength={120}
                    value={values.location[k]}
                    onChange={(e) => setLoc(k, e.target.value)}
                  />
                  {err(`location.${k}`)}
                </div>
              ))}
              <div className="sm:col-span-2">
                <label htmlFor={`${id}-location.notes`} className="eyebrow mb-1.5 block">
                  {t("request.notes")}
                </label>
                <textarea {...aria("location.notes")} rows={2} className={fieldCls("location.notes")} maxLength={2000} value={values.location.notes} onChange={(e) => setLoc("notes", e.target.value)} />
                {err("location.notes")}
              </div>
            </div>
          )}

          {values.kind !== "location" && (
            <div>
              <label htmlFor={`${id}-details`} className="eyebrow mb-1.5 block">
                {t("request.details")}
              </label>
              <textarea {...aria("details")} rows={3} className={fieldCls("details")} maxLength={4000} value={values.details} onChange={(e) => set("details", e.target.value)} />
              {err("details")}
            </div>
          )}

          {failed && (
            <p role="alert" className="text-xs text-danger">
              {t("notice.failed")}
            </p>
          )}
          <button type="button" className="btn btn-primary !py-2 text-sm" disabled={pending} onClick={submit}>
            {pending && <Loader2 size={14} className="animate-spin" />}
            {pending ? t("request.sending") : t("request.submit")}
          </button>
        </>
      )}
    </section>
  );
}
