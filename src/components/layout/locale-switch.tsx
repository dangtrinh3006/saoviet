"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LocaleSwitch() {
  const t = useTranslations("lang");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="radiogroup"
      aria-label={t("label")}
      className={cn("flex rounded-full p-1 ring-1 ring-line", pending && "opacity-60")}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={l === locale}
          onClick={() =>
            startTransition(() =>
              // Keeps the current page: same pathname + dynamic params, other locale.
              // @ts-expect-error -- params shape matches the current route at runtime
              router.replace({ pathname, params }, { locale: l, scroll: false }),
            )
          }
          className={cn(
            "readout h-8 rounded-full px-3 text-xs uppercase transition-colors",
            l === locale ? "bg-ink text-bg" : "text-ink-muted hover:text-ink",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
