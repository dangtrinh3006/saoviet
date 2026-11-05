import { routing } from "@/i18n/routing";

const LOCALE_PREFIX = new RegExp(`^/(${routing.locales.join("|")})(?=/|$|\\?)`);

/** Same-site, locale-less return path for ?next= (the i18n router re-adds the locale). */
export function safeNext(next: string | null): string {
  if (!next) return "/account";
  const path = next.replace(LOCALE_PREFIX, "") || "/";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/account";
}
