"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Entry = { id: string; title: string };

/** Desktop table of contents that highlights the section currently in view. */
export function LegalToc({ entries, label }: { entries: Entry[]; label: string }) {
  const [active, setActive] = useState(entries[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records.filter((r) => r.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // A band near the top of the viewport decides which section is "current".
      { rootMargin: "-20% 0px -65% 0px" },
    );
    entries.forEach((e) => {
      const el = document.getElementById(e.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav aria-label={label}>
      <p className="eyebrow mb-4">{label}</p>
      <ol className="space-y-1 border-l hairline">
        {entries.map((e, i) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              aria-current={active === e.id ? "location" : undefined}
              className={cn(
                "-ml-px flex gap-3 border-l py-1.5 pl-4 text-sm leading-snug transition-colors",
                active === e.id ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              <span className="readout text-xs text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
              <span>{e.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
