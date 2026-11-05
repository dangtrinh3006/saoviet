"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Archive, Copy, Eye, EyeOff, Pencil, Trash } from "@/components/ui/icons";
import { Link, useRouter } from "@/i18n/navigation";
import type { TourStatus } from "@/lib/catalog-schema";
import { cn } from "@/lib/cn";
import { type CatalogResult, deleteTour, duplicateTour, setTourStatus } from "@/server/admin-catalog-actions";

const chip =
  "inline-flex whitespace-nowrap shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs ring-1 ring-line-strong transition-colors hover:ring-ink disabled:opacity-50";

/** `compact` renders icon-only buttons (label kept as accessible name and tooltip) for the dense table. */
export function TourRowActions({ slug, status, title, compact = false }: { slug: string; status: TourStatus; title: string; compact?: boolean }) {
  const t = useTranslations("admincatalog");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = (text: string) => (compact ? <span className="sr-only">{text}</span> : <> {text}</>);
  const tip = (text: string) => (compact ? { title: text } : {});

  const run = (fn: () => Promise<CatalogResult<{ slug: string } | undefined>>, after?: (r: CatalogResult<{ slug: string } | undefined>) => void) =>
    start(async () => {
      setError(null);
      const res = await fn().catch(() => ({ ok: false as const, error: "FAILED" as const }));
      if (!res.ok) {
        setError(res.error === "HAS_ORDERS" ? t("notice.hasOrders") : t("notice.failed"));
        return;
      }
      after?.(res);
      router.refresh();
    });

  return (
    <div className={cn("flex flex-col items-start gap-2", compact && "items-end")}>
      <div role="group" aria-label={t("cols.actions")} className={cn("flex flex-wrap gap-1.5", compact && "flex-nowrap justify-end", pending && "opacity-60")}>
        <Link href={`/admin/tours/${slug}/edit`} className={chip} aria-label={`${t("actions.edit")}: ${title}`} {...tip(t("actions.edit"))}>
          <Pencil size={13} />
          {label(t("actions.edit"))}
        </Link>
        <button
          type="button"
          className={chip}
          {...tip(t("actions.duplicate"))}
          disabled={pending}
          onClick={() => run(() => duplicateTour(slug), (r) => r.ok && r.data && router.push(`/admin/tours/${r.data.slug}/edit`))}
        >
          <Copy size={13} />
          {label(t("actions.duplicate"))}
        </button>
        {status === "published" ? (
          <button type="button" className={chip} {...tip(t("actions.unpublish"))} disabled={pending} onClick={() => run(() => setTourStatus(slug, "draft"))}>
            <EyeOff size={13} />
            {label(t("actions.unpublish"))}
          </button>
        ) : (
          <button type="button" className={cn(chip, "text-aurora ring-aurora/40")} {...tip(t("actions.publish"))} disabled={pending} onClick={() => run(() => setTourStatus(slug, "published"))}>
            <Eye size={13} />
            {label(t("actions.publish"))}
          </button>
        )}
        {status !== "archived" && (
          <button type="button" className={chip} {...tip(t("actions.archive"))} disabled={pending} onClick={() => run(() => setTourStatus(slug, "archived"))}>
            <Archive size={13} />
            {label(t("actions.archive"))}
          </button>
        )}
        {confirming ? (
          <span className="inline-flex items-center gap-1.5">
            <button
              type="button"
              className={cn(chip, "bg-danger/10 text-danger ring-danger/50")}
              disabled={pending}
              onClick={() => run(() => deleteTour(slug), () => setConfirming(false))}
            >
              <Trash size={13} /> {t("actions.confirmDelete")}
            </button>
            <button type="button" className={chip} onClick={() => setConfirming(false)}>
              {t("actions.cancel")}
            </button>
          </span>
        ) : (
          <button type="button" className={cn(chip, "text-danger ring-danger/40")} {...tip(t("actions.delete"))} disabled={pending} onClick={() => setConfirming(true)}>
            <Trash size={13} />
            {label(t("actions.delete"))}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className={cn("max-w-xs text-xs text-danger", compact && "text-right")}>
          {error}
        </p>
      )}
    </div>
  );
}
