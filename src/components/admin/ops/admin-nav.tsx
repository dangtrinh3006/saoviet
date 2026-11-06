"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { History, Layers, MessageSquare, Mountain, Orbit, Shield, Telescope, Users, Warning } from "@/components/ui/icons";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Item = { key: string; href: string; icon: typeof Orbit; match: (path: string, tab: string | null) => boolean };

const ITEMS: Item[] = [
  { key: "overview", href: "/admin", icon: Orbit, match: (p, tab) => p === "/admin" && !tab },
  { key: "tours", href: "/admin/tours", icon: Mountain, match: (p) => p.startsWith("/admin/tours") },
  { key: "services", href: "/admin/services", icon: Telescope, match: (p) => p.startsWith("/admin/services") },
  { key: "orders", href: "/admin/orders", icon: Layers, match: (p) => p.startsWith("/admin/orders") },
  { key: "queue", href: "/admin/queue", icon: Warning, match: (p) => p.startsWith("/admin/queue") },
  { key: "users", href: "/admin?tab=users", icon: Users, match: (p, tab) => (p === "/admin" && tab === "users") || p.startsWith("/admin/users") },
  { key: "outbox", href: "/admin?tab=outbox", icon: MessageSquare, match: (p, tab) => p === "/admin" && tab === "outbox" },
  { key: "moderation", href: "/admin?tab=moderation", icon: Shield, match: (p, tab) => p === "/admin" && tab === "moderation" },
  { key: "audit", href: "/admin/audit", icon: History, match: (p) => p.startsWith("/admin/audit") },
];

/** Vertical rail from lg up; a horizontally scrolling strip below, so the page itself never scrolls sideways. */
export function AdminNav({ openCount }: { openCount: number }) {
  const t = useTranslations("adminops.nav");
  const pathname = usePathname();
  const tab = useSearchParams().get("tab");

  return (
    <nav aria-label={t("label")} className="-mx-5 border-b hairline md:-mx-8 lg:mx-0 lg:border-b-0">
      <ul className="flex gap-1 overflow-x-auto px-5 md:px-8 lg:flex-col lg:overflow-visible lg:px-0">
        {ITEMS.map(({ key, href, icon: Icon, match }) => {
          const active = match(pathname, tab);
          return (
            <li key={key} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors lg:rounded-xl lg:border-b-0 lg:py-2.5",
                  active ? "border-accent text-ink lg:bg-surface" : "border-transparent text-ink-muted hover:text-ink lg:hover:bg-surface/60",
                )}
              >
                <Icon size={16} />
                <span>{t(key)}</span>
                {key === "queue" && openCount > 0 && (
                  <span className="readout rounded-full bg-accent px-1.5 py-0.5 text-[10px] leading-none text-accent-ink" data-testid="queue-badge">
                    <span aria-hidden>{openCount}</span>
                    <span className="sr-only">{t("openCount", { count: openCount })}</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
