import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { canonicalUrl } from "./lib/canonical-host";

const intl = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  // Only production redirects: preview deployments must stay reachable on their own vercel.app URL.
  const target = process.env.VERCEL_ENV === "production" ? canonicalUrl(req.nextUrl, process.env.CANONICAL_HOST) : null;
  if (target) return NextResponse.redirect(target, 308);
  return intl(req);
}

export const config = {
  // Skip API, Next internals and files with an extension (images, fonts, models).
  matcher: "/((?!api|_next|_vercel|.*\..*).*)",
};
