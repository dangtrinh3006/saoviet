import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { SkyPlate } from "@/components/ui/sky-plate";

export async function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const t = await getTranslations("pages");
  return (
    <div className="mx-auto grid min-h-[100svh] max-w-7xl gap-10 px-5 pb-16 pt-24 md:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pt-20">
      <div className="relative hidden h-[78vh] overflow-hidden rounded-[2rem] lg:block">
        <SkyPlate seed="auth-observatory" className="absolute inset-0" sizes="50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <p className="readout text-xs opacity-70">22°38′N 103°37′E · Y TÝ · SQM 21.92</p>
          <p className="display mt-4 max-w-md text-4xl">{t("authQuote")}</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md">
        <p className="readout text-xs text-ink-faint">SAO VIỆT · ACCOUNT</p>
        <h1 className="display mt-4 text-5xl md:text-6xl">{title}</h1>
        <p className="mt-4 text-ink-muted">{subtitle ?? t("authSubtitle")}</p>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
