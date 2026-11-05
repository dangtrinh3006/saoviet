"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useEffect, useId, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Loader2, Plus, Save, Trash, Warning } from "@/components/ui/icons";
import { locations } from "@/content/locations";
import type { L10n } from "@/content/types";
import { Link, useRouter } from "@/i18n/navigation";
import {
  DIFFICULTIES,
  type FieldErrors,
  formToInput,
  IMAGE_HOSTS,
  isImageSrcAllowed,
  LIST_MAX,
  parseTour,
  slugify,
  TOUR_STATUSES,
  type TourFormValues,
} from "@/lib/catalog-schema";
import { cn } from "@/lib/cn";
import { formatVnd, pick } from "@/lib/l10n";
import { createTour, updateTour } from "@/server/admin-catalog-actions";
import { ChangeRequestPanel } from "./change-request-panel";

type Lang = keyof L10n;
const LANGS: Lang[] = ["vi", "en"];
type Step = TourFormValues["itinerary"][number];

const SORTED_LOCATIONS = [...locations].sort((a, b) => a.name.vi.localeCompare(b.name.vi, "vi"));

export function TourForm({ mode, initial, created = false }: { mode: "create" | "edit"; initial: TourFormValues; created?: boolean }) {
  const t = useTranslations("admincatalog");
  const locale = useLocale();
  const router = useRouter();
  const id = useId();
  const [values, setValues] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState<"created" | "saved" | null>(created ? "created" : null);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(values) !== baseline;

  // Warn before a reload/close throws away typed content.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const clearErrors = (prefix: string) =>
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => k !== prefix && !k.startsWith(`${prefix}.`))));

  function patch<K extends keyof TourFormValues>(key: K, value: TourFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    clearErrors(key);
    setSaved(null);
  }

  function setTitle(lang: Lang, v: string) {
    setValues((s) => ({
      ...s,
      title: { ...s.title, [lang]: v },
      slug: lang === "vi" && mode === "create" && !slugTouched ? slugify(v) : s.slug,
    }));
    clearErrors(`title.${lang}`);
    if (lang === "vi" && !slugTouched) clearErrors("slug");
    setSaved(null);
  }

  const errorFor = (path: string) => (errors[path] ? t(t.has(`errors.${errors[path]}`) ? `errors.${errors[path]}` : "errors.invalid") : undefined);

  const control = (path: string, extra?: string) => ({
    id: `${id}-${path}`,
    "data-path": path,
    "aria-invalid": errors[path] ? true : undefined,
    "aria-describedby": errors[path] ? `${id}-${path}-err` : undefined,
    className: cn("field !py-2.5 text-sm", errors[path] && "!border-danger", extra),
  });

  const err = (path: string) =>
    errors[path] ? (
      <p id={`${id}-${path}-err`} className="mt-1 text-xs text-danger">
        {errorFor(path)}
      </p>
    ) : null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const input = formToInput(values);
    const parsed = parseTour(input);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      focusFirst(parsed.errors);
      return;
    }
    start(async () => {
      const res = await (mode === "create" ? createTour(input) : updateTour(initial.slug, input)).catch(() => ({
        ok: false as const,
        error: "FAILED" as const,
        fieldErrors: undefined,
      }));
      // Typed values stay in state on every failure path.
      if (!res.ok) {
        if (res.fieldErrors) {
          setErrors(res.fieldErrors);
          focusFirst(res.fieldErrors);
        }
        setServerError(t(`notice.${res.error}`));
        return;
      }
      setBaseline(JSON.stringify(values));
      setErrors({});
      if (mode === "create") {
        router.push(`/admin/tours/${values.slug}/edit?created=1`);
      } else {
        setSaved("saved");
        router.refresh();
      }
    });
  }

  function focusFirst(found: FieldErrors) {
    const first = Object.keys(found)[0];
    if (!first) return;
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-path="${CSS.escape(first)}"]`)?.focus());
  }

  const errorCount = Object.keys(errors).length;
  const imageOk = values.image.src.trim() !== "" && isImageSrcAllowed(values.image.src.trim());

  return (
    <form noValidate onSubmit={onSubmit} className="mt-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="min-w-0 space-y-6">
          <Section title={t("sections.basics")}>
            <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
              <div>
                <Label htmlFor={`${id}-code`}>{t("fields.code")}</Label>
                <input {...control("code", "readout uppercase")} maxLength={6} placeholder="SV-08" value={values.code} onChange={(e) => patch("code", e.target.value.toUpperCase())} />
                {err("code")}
              </div>
              <div>
                <Label htmlFor={`${id}-slug`}>{t("fields.slug")}</Label>
                <input
                  {...control("slug", "readout")}
                  maxLength={80}
                  readOnly={mode === "edit"}
                  aria-readonly={mode === "edit" || undefined}
                  value={values.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    patch("slug", e.target.value.toLowerCase());
                  }}
                />
                {err("slug") ?? <Hint>{mode === "edit" ? t("fields.slugLocked") : t("fields.slugHint")}</Hint>}
              </div>
            </div>

            <L10nInput label={t("fields.title")} path="title" value={values.title} onChange={setTitle} control={control} err={err} maxLength={120} langLabel={(l) => t(`lang.${l}`)} />
            <L10nInput
              label={t("fields.tagline")}
              path="tagline"
              value={values.tagline}
              onChange={(l, v) => patch("tagline", { ...values.tagline, [l]: v })}
              control={control}
              err={err}
              maxLength={240}
              multiline
              langLabel={(l) => t(`lang.${l}`)}
            />

            <div>
              <Label htmlFor={`${id}-locationSlug`}>{t("fields.location")}</Label>
              <select {...control("locationSlug")} value={values.locationSlug} onChange={(e) => patch("locationSlug", e.target.value)}>
                <option value="">{t("fields.locationPlaceholder")}</option>
                {SORTED_LOCATIONS.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {pick(l.name, locale)} — {pick(l.province, locale)} · SQM {l.sqm.toFixed(2)}
                  </option>
                ))}
              </select>
              {err("locationSlug") ?? <Hint>{t("fields.locationHint")}</Hint>}
              <div className="mt-2">
                <ChangeRequestPanel tourSlug={mode === "edit" ? initial.slug : undefined} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor={`${id}-nights`}>{t("fields.nights")}</Label>
                <input {...control("nights", "readout")} type="number" min={1} max={30} inputMode="numeric" value={values.nights} onChange={(e) => patch("nights", e.target.value)} />
                {err("nights")}
              </div>
              <div>
                <Label htmlFor={`${id}-difficulty`}>{t("fields.difficulty")}</Label>
                <select {...control("difficulty")} value={values.difficulty} onChange={(e) => patch("difficulty", e.target.value as TourFormValues["difficulty"])}>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {t(`difficulty.${d}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor={`${id}-priceVnd`}>{t("fields.priceVnd")}</Label>
                <input {...control("priceVnd", "readout")} type="number" min={0} step={10000} inputMode="numeric" value={values.priceVnd} onChange={(e) => patch("priceVnd", e.target.value)} />
                {err("priceVnd") ?? (
                  <Hint>{values.priceVnd !== "" && Number.isFinite(Number(values.priceVnd)) ? formatVnd(Number(values.priceVnd), locale) : t("fields.priceHint")}</Hint>
                )}
              </div>
              <div>
                <Label htmlFor={`${id}-maxGuests`}>{t("fields.maxGuests")}</Label>
                <input {...control("maxGuests", "readout")} type="number" min={1} max={50} inputMode="numeric" value={values.maxGuests} onChange={(e) => patch("maxGuests", e.target.value)} />
                {err("maxGuests")}
              </div>
            </div>
          </Section>

          <Section title={t("sections.highlights")} count={values.highlights.length}>
            <RepeatList
              items={values.highlights}
              path="highlights"
              newItem={() => ({ vi: "", en: "" })}
              onChange={(items) => patch("highlights", items)}
              addLabel={t("lists.addHighlight")}
              renderItem={(item, i, update) => (
                <L10nInput
                  label={t("lists.highlight", { n: i + 1 })}
                  path={`highlights.${i}`}
                  value={item}
                  onChange={(l, v) => update({ ...item, [l]: v })}
                  control={control}
                  err={err}
                  maxLength={200}
                  langLabel={(l) => t(`lang.${l}`)}
                />
              )}
            />
          </Section>

          <Section title={t("sections.itinerary")} count={values.itinerary.length}>
            <RepeatList<Step>
              items={values.itinerary}
              path="itinerary"
              newItem={() => ({ title: { vi: "", en: "" }, body: { vi: "", en: "" } })}
              onChange={(items) => patch("itinerary", items)}
              addLabel={t("lists.addStep")}
              renderItem={(step, i, update) => (
                <div className="space-y-3">
                  <L10nInput
                    label={t("lists.stepTitle", { n: i + 1 })}
                    path={`itinerary.${i}.title`}
                    value={step.title}
                    onChange={(l, v) => update({ ...step, title: { ...step.title, [l]: v } })}
                    control={control}
                    err={err}
                    maxLength={120}
                    langLabel={(l) => t(`lang.${l}`)}
                  />
                  <L10nInput
                    label={t("lists.stepBody", { n: i + 1 })}
                    path={`itinerary.${i}.body`}
                    value={step.body}
                    onChange={(l, v) => update({ ...step, body: { ...step.body, [l]: v } })}
                    control={control}
                    err={err}
                    maxLength={2000}
                    multiline
                    langLabel={(l) => t(`lang.${l}`)}
                  />
                </div>
              )}
            />
          </Section>

          <Section title={t("sections.includes")} count={values.includes.length}>
            <RepeatList
              items={values.includes}
              path="includes"
              newItem={() => ({ vi: "", en: "" })}
              onChange={(items) => patch("includes", items)}
              addLabel={t("lists.addInclude")}
              renderItem={(item, i, update) => (
                <L10nInput
                  label={t("lists.include", { n: i + 1 })}
                  path={`includes.${i}`}
                  value={item}
                  onChange={(l, v) => update({ ...item, [l]: v })}
                  control={control}
                  err={err}
                  maxLength={200}
                  langLabel={(l) => t(`lang.${l}`)}
                />
              )}
            />
          </Section>
        </div>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Section title={t("sections.publish")}>
            <div>
              <Label htmlFor={`${id}-status`}>{t("fields.status")}</Label>
              <select {...control("status")} value={values.status} onChange={(e) => patch("status", e.target.value as TourFormValues["status"])}>
                {TOUR_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`status.${s}`)}
                  </option>
                ))}
              </select>
              <Hint>{t(`fields.statusHint.${values.status}`)}</Hint>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl p-1">
              <input type="checkbox" className="mt-1 size-4 accent-[var(--accent)]" checked={values.featured} onChange={(e) => patch("featured", e.target.checked)} />
              <span>
                <span className="block text-sm">{t("fields.featured")}</span>
                <span className="block text-xs text-ink-faint">{t("fields.featuredHint")}</span>
              </span>
            </label>
            <div>
              <Label htmlFor={`${id}-sortOrder`}>{t("fields.sortOrder")}</Label>
              <input {...control("sortOrder", "readout")} type="number" step={1} inputMode="numeric" value={values.sortOrder} onChange={(e) => patch("sortOrder", e.target.value)} />
              {err("sortOrder") ?? <Hint>{t("fields.sortOrderHint")}</Hint>}
            </div>
          </Section>

          <Section title={t("sections.image")}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-bg-elev ring-1 ring-line">
              {imageOk ? (
                <ImagePreview key={values.image.src} src={values.image.src.trim()} alt={pick(values.image.alt, locale)} failedLabel={t("image.previewFailed")} />
              ) : (
                <p className="absolute inset-0 grid place-items-center p-4 text-center text-xs text-ink-faint">{t("image.noImage")}</p>
              )}
            </div>
            <div>
              <Label htmlFor={`${id}-image.src`}>{t("image.src")}</Label>
              <input
                {...control("image.src", "readout text-xs")}
                type="url"
                placeholder="https://upload.wikimedia.org/…"
                value={values.image.src}
                onChange={(e) => patch("image", { ...values.image, src: e.target.value })}
              />
              {err("image.src") ?? <Hint>{t("image.srcHint", { hosts: IMAGE_HOSTS.join(", ") })}</Hint>}
            </div>
            <L10nInput
              label={t("image.alt")}
              path="image.alt"
              value={values.image.alt}
              onChange={(l, v) => patch("image", { ...values.image, alt: { ...values.image.alt, [l]: v } })}
              control={control}
              err={err}
              maxLength={200}
              stacked
              langLabel={(l) => t(`lang.${l}`)}
            />
            <div className="grid grid-cols-2 gap-3">
              {(["credit", "license"] as const).map((k) => (
                <div key={k}>
                  <Label htmlFor={`${id}-image.${k}`}>{t(`image.${k}`)}</Label>
                  <input {...control(`image.${k}`)} maxLength={k === "credit" ? 120 : 60} value={values.image[k]} onChange={(e) => patch("image", { ...values.image, [k]: e.target.value })} />
                  {err(`image.${k}`)}
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor={`${id}-image.sourceUrl`}>{t("image.sourceUrl")}</Label>
              <input
                {...control("image.sourceUrl", "readout text-xs")}
                type="url"
                value={values.image.sourceUrl}
                onChange={(e) => patch("image", { ...values.image, sourceUrl: e.target.value })}
              />
              {err("image.sourceUrl")}
            </div>
          </Section>
        </aside>
      </div>

      <div className="sticky bottom-3 z-30 mt-10 rounded-2xl border hairline bg-bg/90 px-4 py-3 shadow-lg backdrop-blur-md md:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 text-sm" role="status" aria-live="polite">
            {serverError || errorCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-danger">
                <Warning size={16} /> {serverError ?? t("notice.VALIDATION")}
                {errorCount > 0 && <span className="readout text-xs">({errorCount})</span>}
              </span>
            ) : saved && !dirty ? (
              <span className="inline-flex items-center gap-1.5 text-aurora">
                <CheckCircle2 size={16} /> {t(`notice.${saved}`)}
              </span>
            ) : dirty ? (
              <span className="text-ink-muted">{t("notice.unsaved")}</span>
            ) : (
              <span className="text-ink-faint">{t("notice.clean")}</span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Link href="/admin/tours" className="btn btn-ghost !py-2.5 text-sm">
              {t("actions.backToList")}
            </Link>
            <button type="submit" className="btn btn-primary !py-2.5 text-sm" disabled={pending}>
              {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {pending ? t("actions.saving") : mode === "create" ? t("actions.create") : t("actions.save")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <fieldset className="card min-w-0 space-y-4 p-4 md:p-6">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-baseline justify-between gap-3" aria-hidden>
        <span className="eyebrow !text-ink">{title}</span>
        {count !== undefined && <span className="readout text-xs text-ink-faint">{count}</span>}
      </div>
      {children}
    </fieldset>
  );
}

const Label = ({ htmlFor, children }: { htmlFor: string; children: ReactNode }) => (
  <label htmlFor={htmlFor} className="eyebrow mb-1.5 block">
    {children}
  </label>
);

const Hint = ({ children }: { children: ReactNode }) => <p className="mt-1 text-xs text-ink-faint">{children}</p>;

type ControlFn = (path: string, extra?: string) => Record<string, unknown> & { className: string };

/** Vietnamese and English side by side, so a missing translation is visible at a glance. */
function L10nInput({
  label,
  path,
  value,
  onChange,
  control,
  err,
  maxLength,
  multiline,
  stacked,
  langLabel,
}: {
  label: string;
  path: string;
  value: L10n;
  onChange: (lang: Lang, v: string) => void;
  control: ControlFn;
  err: (path: string) => ReactNode;
  maxLength: number;
  multiline?: boolean;
  stacked?: boolean;
  langLabel: (l: Lang) => string;
}) {
  return (
    <div role="group" aria-label={label}>
      <p className="eyebrow mb-1.5">{label}</p>
      <div className={cn("grid gap-3", !stacked && "sm:grid-cols-2")}>
        {LANGS.map((l) => {
          const p = `${path}.${l}`;
          const props = { ...control(p), "aria-label": `${label} (${l.toUpperCase()})`, maxLength, value: value[l], placeholder: langLabel(l) };
          return (
            <div key={l} className="relative">
              <span className="readout pointer-events-none absolute right-2.5 top-2 text-[10px] uppercase text-ink-faint" aria-hidden>
                {l}
              </span>
              {multiline ? (
                <textarea {...props} rows={3} className={cn(props.className, "pr-8")} onChange={(e) => onChange(l, e.target.value)} />
              ) : (
                <input {...props} className={cn(props.className, "pr-8")} onChange={(e) => onChange(l, e.target.value)} />
              )}
              {err(p)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RepeatList<T>({
  items,
  path,
  newItem,
  onChange,
  renderItem,
  addLabel,
}: {
  items: T[];
  path: string;
  newItem: () => T;
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, update: (next: T) => void) => ReactNode;
  addLabel: string;
}) {
  const t = useTranslations("admincatalog.lists");
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3" data-path={path}>
      {items.length === 0 && <p className="text-xs text-ink-faint">{t("empty")}</p>}
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl border hairline p-3">
            <div className="min-w-0">{renderItem(item, i, (next) => onChange(items.map((x, j) => (j === i ? next : x))))}</div>
            <div className="flex flex-col gap-1 pt-5">
              <IconButton label={t("moveUp", { n: i + 1 })} disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp size={14} />
              </IconButton>
              <IconButton label={t("moveDown", { n: i + 1 })} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown size={14} />
              </IconButton>
              <IconButton label={t("remove", { n: i + 1 })} danger onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <Trash size={14} />
              </IconButton>
            </div>
          </li>
        ))}
      </ol>
      {items.length < LIST_MAX && (
        <button type="button" className="btn btn-ghost !py-2 text-xs" onClick={() => onChange([...items, newItem()])}>
          <Plus size={14} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded-full ring-1 ring-line transition-colors hover:ring-ink disabled:opacity-30 disabled:hover:ring-line",
        danger && "text-danger hover:ring-danger",
      )}
    >
      {children}
    </button>
  );
}

function ImagePreview({ src, alt, failedLabel }: { src: string; alt: string; failedLabel: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <p className="absolute inset-0 grid place-items-center p-4 text-center text-xs text-danger">{failedLabel}</p>;
  return <Image src={src} alt={alt} fill sizes="340px" className="object-cover" onError={() => setFailed(true)} />;
}
