import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "./logo";

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  return (
    <footer className="relative mt-32 border-t hairline">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-ink-muted">{t("tagline")}</p>
          <p className="readout text-xs text-ink-faint">21°20′N 104°29′E · TÀ XÙA · 2.865 m</p>
        </div>
        <nav className="grid grid-cols-2 gap-3 text-sm" aria-label="Footer">
          {(["tours", "map", "blog", "forum", "services", "account"] as const).map((k) => (
            <Link key={k} href={`/${k}`} className="text-ink-muted hover:text-ink">
              {nav(k)}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 text-xs leading-relaxed text-ink-faint">
          <p className="eyebrow">{t("dataCredits")}</p>
          <p>
            Map © <a className="underline" href="https://openfreemap.org">OpenFreeMap</a> ·{" "}
            <a className="underline" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
          </p>
          <p>
            Air quality & weather: <a className="underline" href="https://open-meteo.com">Open-Meteo</a> (CAMS),
            CC BY 4.0
          </p>
          <p>SQM / Bortle values are estimates for trip planning, not measurements.</p>
        </div>
      </div>
      {/* Owner disclosure without registration numbers: this community project holds none,
          and publishing invented ones would misrepresent a legal entity. */}
      <section aria-labelledby="legal-title" className="border-t hairline">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 text-xs leading-relaxed text-ink-muted md:grid-cols-[1.4fr_1fr] md:px-8">
          <div className="space-y-2">
            <h2 id="legal-title" className="sr-only">{t("legalTitle")}</h2>
            <p className="text-sm font-medium text-ink">{t("org")}</p>
            <p>{t("base")}</p>
            <p>
              {t("responsible")} · {t("builtBy")}: <span className="font-medium text-ink">Nguyễn Đăng Trình</span>
            </p>
            <p className="pt-2 text-ink-faint">{t("nonprofit")}</p>
          </div>
          <nav aria-label="Legal" className="flex flex-col gap-2 md:items-end">
            <Link href="/privacy" className="hover:text-ink">{t("privacyLink")}</Link>
            <Link href="/terms" className="hover:text-ink">{t("termsLink")}</Link>
            <Link href="/contact" className="hover:text-ink">{t("contactLink")}</Link>
          </nav>
        </div>
      </section>
      <div className="border-t hairline">
        <p className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-5 py-6 text-xs text-ink-faint md:px-8">
          <span>
            © {new Date().getFullYear()} Sao Việt · {t("rights")}
          </span>
          <span>
            Crafted by <span className="text-ink-muted">Nguyễn Đăng Trình</span>
          </span>
        </p>
      </div>
    </footer>
  );
}
