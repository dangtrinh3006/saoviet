import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountSettings } from "@/components/account/account-settings";
import { ArrowLeft } from "@/components/ui/icons";
import { db, schema } from "@/db";
import { Link, redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/settings">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accountx" });
  return { title: t("title"), robots: { index: false } };
}

export default async function AccountSettingsPage({ params }: PageProps<"/[locale]/account/settings">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) return redirect({ href: "/sign-in?next=/account/settings", locale });
  const [t, [credential]] = await Promise.all([
    getTranslations("accountx"),
    db
      .select({ id: schema.account.id })
      .from(schema.account)
      .where(and(eq(schema.account.userId, session.user.id), eq(schema.account.providerId, "credential")))
      .limit(1),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-28 md:px-8 md:pt-40">
      <Link href="/account" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={14} /> {t("back")}
      </Link>
      <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.5rem)]">{t("title")}</h1>
      <div className="mt-10">
        <AccountSettings name={session.user.name} email={session.user.email} hasPassword={Boolean(credential)} />
      </div>
    </div>
  );
}
