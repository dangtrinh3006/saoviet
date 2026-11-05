import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export async function generateMetadata({ params }: PageProps<"/[locale]/reset-password">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "authx.reset" });
  // The URL carries the reset token: keep it out of Referer headers and search indexes.
  return { title: t("title"), robots: { index: false, follow: false }, referrer: "no-referrer" };
}

export default async function ResetPasswordPage({ params, searchParams }: PageProps<"/[locale]/reset-password">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token, error } = await searchParams;
  const valid = typeof token === "string" && token.length > 0 && !error;
  const t = await getTranslations("authx.reset");
  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <ResetPasswordForm token={valid ? token : null} />
    </AuthShell>
  );
}
