import type { TourStatus } from "@/lib/catalog-schema";
import { cn } from "@/lib/cn";

const TONE: Record<TourStatus, string> = {
  draft: "bg-accent/15 text-accent",
  published: "bg-aurora/15 text-aurora",
  archived: "bg-ink/10 text-ink-muted",
};

export function PublishChip({ status, label }: { status: TourStatus; label: string }) {
  return (
    <span className={cn("readout inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wider", TONE[status])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
