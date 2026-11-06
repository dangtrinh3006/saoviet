"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { db, schema } from "@/db";
import { routing } from "@/i18n/routing";
import { auth, requireAdmin } from "@/lib/auth";
import { audit } from "./audit";

export type AdminResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const userIdInput = z.string().min(1).max(200);
const localeInput = z.enum(routing.locales);

async function findUser(userId: unknown) {
  const parsed = userIdInput.safeParse(userId);
  if (!parsed.success) return null;
  const [row] = await db
    .select({ id: schema.user.id, email: schema.user.email })
    .from(schema.user)
    .where(eq(schema.user.id, parsed.data))
    .limit(1);
  return row ?? null;
}

// Unambiguous alphabet (no 0/O/1/l/I) so the password survives being read aloud or retyped.
function tempPassword(length = 14) {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const limit = 256 - (256 % abc.length); // rejection sampling avoids modulo bias
  const out: string[] = [];
  while (out.length < length) {
    for (const b of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (b < limit && out.length < length) out.push(abc[b % abc.length]);
    }
  }
  return out.join("");
}

/** Sends the user the same reset email as the public form; the email comes from the DB, not the client. */
export async function adminSendResetEmail(userId: string, locale: string): Promise<AdminResult> {
  const admin = await requireAdmin();
  const user = await findUser(userId);
  const loc = localeInput.safeParse(locale);
  if (!user || !loc.success) return { ok: false, error: "INVALID_INPUT" };
  try {
    await auth.api.requestPasswordReset({ body: { email: user.email, redirectTo: `/${loc.data}/reset-password` } });
  } catch {
    return { ok: false, error: "RESET_EMAIL_FAILED" };
  }
  await audit(admin, "user.reset_email", { type: "user", id: user.id });
  return { ok: true };
}

/** Returns the generated password once to the admin UI; it is never logged or stored in clear. */
export async function adminSetTempPassword(userId: string): Promise<AdminResult<{ password: string }>> {
  const admin = await requireAdmin();
  const user = await findUser(userId);
  if (!user) return { ok: false, error: "INVALID_INPUT" };
  const password = tempPassword();
  try {
    await auth.api.setUserPassword({ body: { userId: user.id, newPassword: password }, headers: await headers() });
  } catch {
    return { ok: false, error: "SET_PASSWORD_FAILED" };
  }
  await audit(admin, "user.temp_password", { type: "user", id: user.id });
  return { ok: true, data: { password } };
}

export async function adminRevokeSessions(userId: string): Promise<AdminResult> {
  const admin = await requireAdmin();
  const user = await findUser(userId);
  if (!user) return { ok: false, error: "INVALID_INPUT" };
  try {
    await auth.api.revokeUserSessions({ body: { userId: user.id }, headers: await headers() });
  } catch {
    return { ok: false, error: "REVOKE_FAILED" };
  }
  await audit(admin, "user.revoke_sessions", { type: "user", id: user.id });
  return { ok: true };
}

export async function listOutbox(limit = 100) {
  await requireAdmin();
  return db
    .select()
    .from(schema.mailOutbox)
    .orderBy(desc(schema.mailOutbox.createdAt))
    .limit(Math.min(Math.max(1, limit), 500));
}
