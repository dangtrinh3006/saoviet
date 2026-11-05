import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TourBrowser } from "@/components/tours/tour-browser";
import { Reveal } from "@/components/ui/reveal";
import { listTours } from "@/server/catalog";
import { ratingSummary } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/tours">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tours" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ToursPage({ params }: PageProps<"/[locale]/tours">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tours");
  const [ratings, tours] = await Promise.all([ratingSummary().catch(() => ({})), listTours()]);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 md:px-8 md:pt-44">
      <Reveal className="mb-12 max-w-3xl">
        <p className="readout text-xs text-ink-faint">CATALOGUE · SV-01 — SV-{String(tours.length).padStart(2, "0")}</p>
        <h1 className="display mt-5 text-[clamp(2.8rem,8vw,6.5rem)]">{t("title")}</h1>
        <p className="mt-6 text-lg text-ink-muted">{t("subtitle")}</p>
      </Reveal>
      <TourBrowser tours={tours} ratings={ratings} />
    </div>
  );
}
