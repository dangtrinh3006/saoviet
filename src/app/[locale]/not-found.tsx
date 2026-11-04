import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <section className="relative grid min-h-[80svh] place-items-center overflow-hidden px-5 pt-24 text-center">
      <div className="chart-grid absolute inset-0 opacity-60" />
      <div className="relative">
        <p className="readout text-xs text-ink-faint">ERR 404 · OBJECT NOT IN CATALOGUE</p>
        <h1 className="display mt-6 text-[clamp(4rem,16vw,11rem)] text-gradient">404</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-muted">Không tìm thấy vật thể này trên bầu trời. · This object is not in our sky.</p>
        <Link href="/" className="btn btn-primary mt-8">
          {t("back")}
        </Link>
      </div>
    </section>
  );
}
