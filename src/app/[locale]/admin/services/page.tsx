import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServiceMove } from "@/components/admin/ops/ops-controls";
import { SERVICE_ICON_COMPONENTS } from "@/components/admin/ops/service-icons";
import { Pencil, Plus } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { formatVnd, pick } from "@/lib/l10n";
import { adminPageSession, listServicesAdmin } from "@/server/ops-queries";

const TONE = { draft: "text-ink-muted ring-line", published: "text-aurora ring-aurora/40", archived: "text-ink-faint ring-line line-through" } as const;

export default async function AdminServicesPage({ params }: PageProps<"/[locale]/admin/services">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await adminPageSession();
  const [rows, t] = await Promise.all([listServicesAdmin(), getTranslations("adminops")]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[clamp(2.2rem,5vw,3.75rem)]">{t("services.title")}</h1>
          <p className="mt-3 max-w-2xl text-sm text-ink-muted">{t("services.subtitle")}</p>
        </div>
        <Link href="/admin/services/new" className="btn btn-primary">
          <Plus size={16} /> {t("services.new")}
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-ink-faint">{t("common.empty")}</p>
      ) : (
        <ol className="mt-8 divide-y divide-line border-y hairline">
          {rows.map((s, i) => {
            const Icon = SERVICE_ICON_COMPONENTS[s.icon];
            const name = pick(s.title, locale);
            return (
              <li key={s.slug} data-slug={s.slug} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 py-4 md:grid-cols-[2rem_auto_minmax(0,1fr)_auto_auto_auto]">
                <span className="readout hidden text-xs text-ink-faint md:block">{String(i + 1).padStart(2, "0")}</span>
                <span className="grid size-10 place-items-center rounded-full ring-1 ring-line">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{name}</p>
                  <p className="readout truncate text-xs text-ink-faint">{s.slug}</p>
                </div>
                <span className="readout col-start-2 text-sm md:col-start-auto">{formatVnd(s.fromVnd, locale)}</span>
                <span className={cn("readout col-start-2 w-fit rounded-full px-2.5 py-1 text-[11px] uppercase ring-1 md:col-start-auto", TONE[s.status])}>
                  {t(`services.statuses.${s.status}`)}
                </span>
                <span className="col-start-2 flex items-center gap-2 md:col-start-auto">
                  <ServiceMove slug={s.slug} name={name} first={i === 0} last={i === rows.length - 1} />
                  <Link
                    href={`/admin/services/${s.slug}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ring-1 ring-line hover:bg-surface"
                    aria-label={`${t("common.edit")} ${name}`}
                  >
                    <Pencil size={13} /> {t("common.edit")}
                  </Link>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
