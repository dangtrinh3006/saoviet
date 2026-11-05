"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { CONTACT_TOPICS, type ContactTopic, contactInput, MESSAGE_MAX, MESSAGE_MIN } from "@/lib/contact-schema";
import { sendContactMessage } from "@/server/contact-actions";

type Field = "name" | "email" | "topic" | "message";
type Errors = Partial<Record<Field, string>>;

const EMPTY = { name: "", email: "", topic: "", message: "", website: "" };

export function ContactForm({ defaultTopic }: { defaultTopic?: ContactTopic }) {
  const t = useTranslations("legal.contact");
  const numberLocale = useLocale() === "en" ? "en-US" : "vi-VN";
  const id = useId();
  const [values, setValues] = useState({ ...EMPTY, topic: defaultTopic ?? "" });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState(false);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  const set = (field: keyof typeof EMPTY) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (field in errors) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  function validate() {
    const result = contactInput.safeParse(values);
    if (result.success) return { data: result.data, errors: {} };
    const next: Errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as Field;
      if (next[field]) continue;
      if (field === "message") {
        next.message = values.message.trim().length < MESSAGE_MIN ? t("errors.messageShort") : t("errors.messageLong");
      } else if (field === "name" || field === "email" || field === "topic") {
        next[field] = t(`errors.${field}`);
      }
    }
    return { data: null, errors: next };
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-start gap-5 py-6">
        <span className="grid size-14 place-items-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 size={28} />
        </span>
        <div>
          <h3 className="display text-3xl">{t("successTitle")}</h3>
          <p className="mt-3 max-w-md leading-relaxed text-ink-muted">{t("successBody")}</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setValues({ ...EMPTY, topic: defaultTopic ?? "" });
            setSent(false);
          }}
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  const fieldProps = (field: Field) => ({
    id: `${id}-${field}`,
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${id}-${field}-error` : undefined,
    className: cn("field", errors[field] && "border-danger focus:border-danger"),
  });

  const errorText = (field: Field) =>
    errors[field] && (
      <p id={`${id}-${field}-error`} className="text-sm text-danger">
        {errors[field]}
      </p>
    );

  const length = values.message.trim().length;
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setServerError(false);
        const { data, errors: found } = validate();
        setErrors(found);
        if (!data) return;
        start(async () => {
          const res = await sendContactMessage(data).catch(() => ({ ok: false as const }));
          // Keep every field on failure so a transient error never costs the user their text.
          if (!res.ok) return setServerError(true);
          setSent(true);
        });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={`${id}-name`} className="eyebrow block">
            {t("name")}
          </label>
          <input {...fieldProps("name")} autoComplete="name" maxLength={80} value={values.name} onChange={set("name")} />
          {errorText("name")}
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-email`} className="eyebrow block">
            {t("email")}
          </label>
          <input {...fieldProps("email")} type="email" autoComplete="email" maxLength={120} value={values.email} onChange={set("email")} />
          {errorText("email")}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${id}-topic`} className="eyebrow block">
          {t("topic")}
        </label>
        <select {...fieldProps("topic")} value={values.topic} onChange={set("topic")}>
          <option value="" disabled>
            {t("topicPlaceholder")}
          </option>
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {t(`topics.${topic}`)}
            </option>
          ))}
        </select>
        {errorText("topic")}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor={`${id}-message`} className="eyebrow block">
            {t("message")}
          </label>
          <span className={cn("readout text-xs", length > MESSAGE_MAX ? "text-danger" : "text-ink-faint")} aria-hidden>
            {length.toLocaleString(numberLocale)} / {MESSAGE_MAX.toLocaleString(numberLocale)}
          </span>
        </div>
        <textarea {...fieldProps("message")} className={cn(fieldProps("message").className, "min-h-44 resize-y")} value={values.message} onChange={set("message")} />
        {errors.message ? errorText("message") : <p className="text-xs text-ink-faint">{t("messageHint")}</p>}
      </div>

      {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
        </label>
      </div>

      {(hasErrors || serverError) && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {serverError ? t("errors.server") : t("errors.summary")}
        </p>
      )}

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-relaxed text-ink-faint">
          {t("consent")}{" "}
          <Link href="/privacy" className="text-ink-muted underline underline-offset-4 hover:text-accent">
            {t("consentLink")}
          </Link>
          .
        </p>
        <button type="submit" disabled={pending} className="btn btn-primary shrink-0 justify-center disabled:opacity-60">
          {pending && <Loader2 size={16} className="animate-spin" />}
          {pending ? t("sending") : t("submit")}
        </button>
      </div>
    </form>
  );
}
