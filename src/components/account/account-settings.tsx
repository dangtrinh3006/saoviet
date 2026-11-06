"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import { changeMyPassword, deleteMyAccount, setMyPassword, updateMyName, type AccountResult } from "@/server/account-actions";

type Notice = { ok: boolean; text: string } | null;

function Section({ title, children, danger = false }: { title: string; children: ReactNode; danger?: boolean }) {
  return (
    <section className={cn("card p-6 md:p-8", danger && "ring-1 ring-danger/30")}>
      <h2 className={cn("display text-2xl", danger && "text-danger")}>{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Status({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <p role={notice.ok ? "status" : "alert"} className={cn("text-sm", notice.ok ? "text-accent" : "text-danger")}>
      {notice.text}
    </p>
  );
}

/** Each form keeps its input after a failed submit; only a success clears the password fields. */
export function AccountSettings({ name, email, hasPassword }: { name: string; email: string; hasPassword: boolean }) {
  const t = useTranslations("accountx");
  const router = useRouter();
  const [busy, start] = useTransition();
  const [notices, setNotices] = useState<Record<string, Notice>>({});
  const note = (key: string, n: Notice) => setNotices((s) => ({ ...s, [key]: n }));
  const fail = (key: string, res: AccountResult) => !res.ok && note(key, { ok: false, text: t(`errors.${res.error}`) });

  const submit = (key: string, fn: (form: FormData, el: HTMLFormElement) => Promise<string | void>) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    const form = new FormData(el);
    note(key, null);
    start(async () => {
      try {
        const okText = await fn(form, el);
        if (okText) note(key, { ok: true, text: okText });
      } catch {
        note(key, { ok: false, text: t("errors.FAILED") });
      }
    });
  };

  return (
    <div className="space-y-8">
      <Section title={t("profile.title")}>
        <form
          className="space-y-4"
          onSubmit={submit("profile", async (f) => {
            const res = await updateMyName(String(f.get("name") ?? ""));
            if (!res.ok) return void fail("profile", res);
            router.refresh();
            return t("saved");
          })}
        >
          <label className="block space-y-2">
            <span className="eyebrow">{t("profile.name")}</span>
            <input name="name" defaultValue={name} className="field" autoComplete="name" minLength={2} maxLength={80} required />
          </label>
          <p className="text-sm text-ink-muted">
            {t("profile.email")}: <span className="text-ink">{email}</span> · <span className="text-ink-faint">{t("profile.emailNote")}</span>
          </p>
          <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-60">
            {t("profile.save")}
          </button>
          <Status notice={notices.profile} />
        </form>
      </Section>

      <Section title={t("password.title")}>
        {hasPassword ? (
          <form
            className="space-y-4"
            onSubmit={submit("password", async (f, el) => {
              const res = await changeMyPassword(String(f.get("current") ?? ""), String(f.get("next") ?? ""));
              if (!res.ok) return void fail("password", res);
              el.reset();
              return t("password.changed");
            })}
          >
            <label className="block space-y-2">
              <span className="eyebrow">{t("password.current")}</span>
              <input name="current" type="password" className="field" autoComplete="current-password" required />
            </label>
            <label className="block space-y-2">
              <span className="eyebrow">{t("password.new")}</span>
              <input name="next" type="password" className="field" autoComplete="new-password" minLength={8} required />
              <span className="block text-xs text-ink-faint">{t("password.hint")}</span>
            </label>
            <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-60">
              {t("password.change")}
            </button>
            <Status notice={notices.password} />
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={submit("password", async (f, el) => {
              const res = await setMyPassword(String(f.get("next") ?? ""));
              if (!res.ok) return void fail("password", res);
              el.reset();
              router.refresh();
              return t("password.setDone");
            })}
          >
            <p className="text-sm text-ink-muted">{t("password.googleOnly")}</p>
            <label className="block space-y-2">
              <span className="eyebrow">{t("password.new")}</span>
              <input name="next" type="password" className="field" autoComplete="new-password" minLength={8} required />
              <span className="block text-xs text-ink-faint">{t("password.hint")}</span>
            </label>
            <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-60">
              {t("password.set")}
            </button>
            <Status notice={notices.password} />
          </form>
        )}
      </Section>

      <Section title={t("data.title")}>
        <p className="text-sm text-ink-muted">{t("data.exportBody")}</p>
        {/* A plain link: the browser handles the attachment download, no client JS needed. */}
        <a href="/api/account/export" className="btn btn-ghost" download>
          {t("data.export")}
        </a>
      </Section>

      <Section title={t("delete.title")} danger>
        <form
          className="space-y-4"
          onSubmit={submit("delete", async (f) => {
            const res = await deleteMyAccount(String(f.get("confirm") ?? ""), f.get("content") === "keep");
            if (!res.ok) return void fail("delete", res);
            await signOut().catch(() => undefined);
            router.replace("/");
            router.refresh();
          })}
        >
          <p className="text-sm text-ink-muted">{t("delete.body")}</p>
          <fieldset className="space-y-2 text-sm">
            <label className="flex items-start gap-3">
              <input type="radio" name="content" value="keep" defaultChecked className="mt-1" />
              <span>{t("delete.keep")}</span>
            </label>
            <label className="flex items-start gap-3">
              <input type="radio" name="content" value="remove" className="mt-1" />
              <span>{t("delete.remove")}</span>
            </label>
          </fieldset>
          <label className="block space-y-2">
            <span className="eyebrow">{t("delete.confirmLabel")}</span>
            <input name="confirm" type="email" className="field" autoComplete="off" placeholder={email} required />
          </label>
          <button type="submit" disabled={busy} className="btn w-full justify-center bg-danger text-white disabled:opacity-60 sm:w-auto">
            {t("delete.submit")}
          </button>
          <p className="text-xs text-ink-faint">{t("delete.irreversible")}</p>
          <Status notice={notices.delete} />
        </form>
      </Section>
    </div>
  );
}
