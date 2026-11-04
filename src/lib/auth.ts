import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { headers } from "next/headers";
import { db, schema } from "@/db";

// On Vercel the production domain comes from the platform; BETTER_AUTH_URL overrides it.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const baseURL = process.env.BETTER_AUTH_URL ?? (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3100");

export const auth = betterAuth({
  baseURL,
  trustedOrigins: [baseURL, ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [])],
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
  session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
  // nextCookies must stay last: it lets server actions set the session cookie.
  plugins: [admin(), nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Authorization reads the role from the DB: the cookie cache would keep a revoked admin for minutes. */
export async function getFreshSession() {
  return auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

export async function requireAdmin() {
  const session = await getFreshSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (session.user.role !== "admin") throw new Error("FORBIDDEN");
  return session;
}
