import type { ReactNode } from "react";
import { Reveal } from "./reveal";

export function SectionHeading({
  index,
  title,
  subtitle,
  action,
}: {
  index: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <Reveal className="mb-10 flex flex-col gap-6 border-t hairline pt-6 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="readout text-xs text-ink-faint">{index}</p>
        <h2 className="display mt-4 text-[clamp(2.2rem,5vw,4rem)]">{title}</h2>
        {subtitle && <p className="mt-4 text-ink-muted md:text-lg">{subtitle}</p>}
      </div>
      {action}
    </Reveal>
  );
}
