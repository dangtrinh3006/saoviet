import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocument } from "@/components/legal/legal-document";
import { privacyPolicy } from "@/content/legal";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  return { title: t("title"), description: t("metaDescription") };
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal.privacy");

  return (
    <LegalDocument
      doc={privacyPolicy}
      locale={locale}
      eyebrow={t("eyebrow")}
      title={t("title")}
      intro={t("intro")}
      contactHref="/contact?topic=privacy"
      seeAlso={{ href: "/terms", label: t("seeAlso") }}
    />
  );
}
