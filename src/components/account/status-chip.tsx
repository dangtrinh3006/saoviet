import { cn } from "@/lib/cn";

const TONE = {
  pending: "bg-accent/15 text-accent",
  confirmed: "bg-aurora/15 text-aurora",
  completed: "bg-ink/10 text-ink",
  cancelled: "bg-danger/10 text-danger line-through decoration-1",
} as const;

export type OrderStatus = keyof typeof TONE;

export function StatusChip({ status, label }: { status: OrderStatus; label: string }) {
  return (
    <span className={cn("readout inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wider", TONE[status])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
