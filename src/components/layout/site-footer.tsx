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
      {/* Mirrors the owner disclosure Vietnamese e-commerce sites must show (ND 52/2013, ND 85/2021);
          every number is a labelled mock because this company does not exist. */}
      <section aria-labelledby="legal-title" className="border-t hairline">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 text-xs leading-relaxed text-ink-muted md:grid-cols-[1.4fr_1fr] md:px-8">
          <div className="space-y-2">
            <h2 id="legal-title" className="eyebrow">{t("legalTitle")}</h2>
            <p className="text-sm font-medium text-ink">{t("company")}</p>
            <p>
              {t("taxId")}: <span className="readout">0000000000</span> — {t("taxIssuer")}
            </p>
            <p>
              {t("travelLicense")}: <span className="readout">00-000/2026/CDLQGVN-GP LHQT</span> — {t("travelIssuer")}
            </p>
            <p>{t("address")}: Tầng 9, Tòa nhà Mô Phỏng, Quận Ba Đình, Hà Nội</p>
            <p>
              {t("hotline")}: <span className="readout">1900 0000</span> · Email: <span className="readout">hello@saoviet.example</span>
            </p>
            <p>
              {t("responsible")} · {t("builtBy")}: <span className="font-medium text-ink">Nguyễn Đăng Trình</span>
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-dashed hairline px-3 py-2.5" aria-label={t("moit")}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-[10px] font-semibold text-ink-faint">
                BCT
              </span>
              <span className="text-[11px] text-ink-faint">{t("moit")}</span>
            </div>
            <p>{t("privacy")}</p>
            <p>{t("terms")}</p>
            <p className="rounded-lg bg-bg-elev px-3 py-2 text-[11px] text-ink-faint">{t("demoNotice")}</p>
          </div>
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
