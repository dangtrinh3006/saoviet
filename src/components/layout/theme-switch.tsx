"use client";

import { Eye, Moon, Sun } from "@/components/ui/icons";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/use-client";

const THEMES = [
  { id: "dark", Icon: Moon },
  { id: "light", Icon: Sun },
  { id: "red", Icon: Eye },
] as const;

export function ThemeSwitch() {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div role="radiogroup" aria-label={t("label")} className="flex rounded-full p-1 ring-1 ring-line">
      {THEMES.map(({ id, Icon }) => {
        const active = mounted && theme === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            title={t(id)}
            aria-label={t(id)}
            onClick={() => setTheme(id)}
            className={cn(
              "grid size-8 place-items-center rounded-full transition-colors",
              active ? "bg-ink text-bg" : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon size={15} strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}
