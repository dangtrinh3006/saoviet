"use client";

import { CheckCircle2, Loader2, MoonStar } from "@/components/ui/icons";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import type { Tour } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import { formatVnd } from "@/lib/l10n";
import { moonInfo } from "@/lib/sky";
import { createOrder } from "@/server/actions";

const iso = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

/** Next 42 nights, each tagged with moonlight so guests can pick dark nights. */
function useNights() {
  return useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 3);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      d.setHours(22, 0, 0, 0);
      const m = moonInfo(d);
      return { date: iso(d), day: d.getDate(), month: d.getMonth() + 1, weekday: d.getDay(), illumination: m.illumination };
    });
  }, []);
}

export function BookingWidget({ tour }: { tour: Tour }) {
  const t = useTranslations("booking");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: session } = useSession();
  const nights = useNights();
  const [date, setDate] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "" });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const chosen = nights.find((n) => n.date === date);
  const name = form.name || session?.user.name || "";
  const email = form.email || session?.user.email || "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return setError(t("date"));
    setError(null);
    start(async () => {
      const res = await createOrder({ tourSlug: tour.slug, departureDate: date, guests, contactName: name, contactEmail: email, contactPhone: form.phone, note: form.note });
      // Inputs are kept on failure so a transient error never wipes the form.
      if (res.ok) setDone(res.data!.code);
      else setError(`${tc("error")} (${res.error})`);
    });
  };

  if (done) {
    return (
      <div className="card p-6 text-center md:p-8">
        <CheckCircle2 className="mx-auto text-accent" size={40} strokeWidth={1.25} />
        <h3 className="display mt-4 text-3xl">{t("success")}</h3>
        <p className="mt-2 text-sm text-ink-muted">{t("code")}</p>
        <p className="readout mt-1 text-2xl tracking-widest text-accent">{done}</p>
        {session ? (
          <Link href="/account" className="btn btn-ghost mt-6">
            {tc("back")} → {t("signInToTrack").split(" ").slice(-2).join(" ")}
          </Link>
        ) : (
          <Link href="/sign-up?next=/account" className="btn btn-ghost mt-6">
            {t("signInToTrack")}
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-6 p-5 md:p-7">
      <div className="flex items-baseline justify-between">
        <h3 className="display text-2xl">{t("title")}</h3>
        <p className="readout text-sm text-ink-muted">{formatVnd(tour.priceVnd, locale)} / {locale === "en" ? "guest" : "khách"}</p>
      </div>

      <fieldset>
        <legend className="eyebrow mb-3">{t("date")}</legend>
        <div className="grid grid-cols-7 gap-1">
          {nights.map((n) => {
            const bright = n.illumination > 0.6;
            return (
              <button
                key={n.date}
                type="button"
                onClick={() => setDate(n.date)}
                aria-pressed={date === n.date}
                title={`${n.date} · ☾ ${Math.round(n.illumination * 100)}%`}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors",
                  date === n.date ? "bg-accent text-accent-ink" : "bg-bg-elev hover:ring-1 hover:ring-line-strong",
                  bright && date !== n.date && "text-ink-faint",
                )}
              >
                <span className="readout">{n.day}</span>
                {/* Dot size = moonlight: small dot = dark night. */}
                <span className="mt-0.5 rounded-full bg-current" style={{ width: 2 + n.illumination * 5, height: 2 + n.illumination * 5, opacity: 0.6 }} />
              </button>
            );
          })}
        </div>
        {chosen && chosen.illumination > 0.6 && (
          <p className="mt-3 flex items-center gap-2 text-xs text-accent">
            <MoonStar size={14} /> {t("moonWarning")}
          </p>
        )}
      </fieldset>

      <div className="flex items-center justify-between">
        <span className="eyebrow">{t("guests")}</span>
        <div className="flex items-center gap-1 rounded-full p-1 ring-1 ring-line">
          <button type="button" className="grid size-9 place-items-center rounded-full hover:bg-bg-elev" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="−">
            −
          </button>
          <span className="readout w-8 text-center">{guests}</span>
          <button type="button" className="grid size-9 place-items-center rounded-full hover:bg-bg-elev" onClick={() => setGuests((g) => Math.min(tour.maxGuests, g + 1))} aria-label="+">
            +
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        <input className="field" required placeholder={t("name")} value={name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="field" required type="email" placeholder={t("email")} value={email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
          <input className="field" required type="tel" placeholder={t("phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
        </div>
        <textarea className="field min-h-20" placeholder={t("note")} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
      </div>

      <div className="flex items-end justify-between border-t hairline pt-5">
        <div>
          <p className="eyebrow">{t("total")}</p>
          <p className="readout mt-1 text-2xl">{formatVnd(tour.priceVnd * guests, locale)}</p>
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending && <Loader2 className="animate-spin" size={16} />} {t("submit")}
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </form>
  );
}
