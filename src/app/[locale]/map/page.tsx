import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { SkyMap } from "@/components/map/sky-map";
import { listTours } from "@/server/catalog";

export async function generateMetadata({ params }: PageProps<"/[locale]/map">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "map" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function MapPage({ params }: PageProps<"/[locale]/map">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <SkyMap tours={await listTours()} />
    </Suspense>
  );
}
