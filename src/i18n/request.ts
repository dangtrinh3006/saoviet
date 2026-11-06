import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Feature teams own their own message files (messages/extra/<feature>.<locale>.json),
// merged as top-level namespaces so parallel work never edits the same JSON.
const FEATURES = ["auth", "timeline", "legal", "admincatalog", "adminops", "pano", "adminusers"] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const base = (await import(`../../messages/${locale}.json`)).default;
  const extras = await Promise.all(
    FEATURES.map(async (f) => (await import(`../../messages/extra/${f}.${locale}.json`)).default as Record<string, unknown>),
  );
  return {
    locale,
    messages: Object.assign({}, base, ...extras),
    timeZone: "Asia/Ho_Chi_Minh",
  };
});
