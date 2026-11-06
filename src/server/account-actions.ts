"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { db, schema } from "@/db";
import { anonymousIdentity } from "@/lib/account-data";
import { auth, requireUser } from "@/lib/auth";
import { audit } from "./audit";

export type AccountResult = { ok: true } | { ok: false; error: "INVALID_INPUT" | "WRONG_PASSWORD" | "HAS_PASSWORD" | "EMAIL_MISMATCH" | "FAILED" };

const password = z.string().min(8).max(128);

export async function updateMyName(name: string): Promise<AccountResult> {
  await requireUser();
  const parsed = z.string().trim().min(2).max(80).safeParse(name);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  try {
    await auth.api.updateUser({ body: { name: parsed.data }, headers: await headers() });
  } catch {
    return { ok: false, error: "FAILED" };
  }
  revalidatePath("/[locale]/account", "layout");
  return { ok: true };
}

/** Other devices are signed out: a password change usually means the old one was exposed. */
export async function changeMyPassword(currentPassword: string, newPassword: string): Promise<AccountResult> {
  await requireUser();
  if (!z.string().min(1).max(128).safeParse(currentPassword).success || !password.safeParse(newPassword).success) return { ok: false, error: "INVALID_INPUT" };
  try {
    await auth.api.changePassword({ body: { currentPassword, newPassword, revokeOtherSessions: true }, headers: await headers() });
  } catch {
    return { ok: false, error: "WRONG_PASSWORD" };
  }
  return { ok: true };
}

/** For Google-only accounts: adds an email + password sign-in alongside Google. */
export async function setMyPassword(newPassword: string): Promise<AccountResult> {
  const session = await requireUser();
  if (!password.safeParse(newPassword).success) return { ok: false, error: "INVALID_INPUT" };
  const [existing] = await db
    .select({ id: schema.account.id })
    .from(schema.account)
    .where(and(eq(schema.account.userId, session.user.id), eq(schema.account.providerId, "credential")))
    .limit(1);
  if (existing) return { ok: false, error: "HAS_PASSWORD" };
  try {
    await auth.api.setPassword({ body: { newPassword }, headers: await headers() });
  } catch {
    return { ok: false, error: "FAILED" };
  }
  revalidatePath("/[locale]/account/settings", "page");
  return { ok: true };
}

/**
 * Deletes the account. Orders stay (detached) for the 24-month complaint window promised in the privacy policy;
 * reviews, comments and threads are deleted or, if the user chose so, moved to an anonymous placeholder owner.
 */
export async function deleteMyAccount(confirmEmail: string, keepContent: boolean): Promise<AccountResult> {
  const session = await requireUser();
  const userId = session.user.id;
  if (confirmEmail.trim().toLowerCase() !== session.user.email.toLowerCase()) return { ok: false, error: "EMAIL_MISMATCH" };
  try {
    await db.transaction(async (tx) => {
      const owned = async (table: typeof schema.review | typeof schema.comment | typeof schema.thread) =>
        (await tx.select({ id: table.id }).from(table).where(eq(table.userId, userId)).limit(1)).length > 0;
      // A placeholder owner is only worth creating when there is content to keep.
      if (keepContent && ((await owned(schema.review)) || (await owned(schema.comment)) || (await owned(schema.thread)))) {
        const ghostId = crypto.randomUUID();
        await tx.insert(schema.user).values({ id: ghostId, ...anonymousIdentity(ghostId), emailVerified: false, role: "user", banned: true, banReason: "deleted-account placeholder" });
        await tx.update(schema.review).set({ userId: ghostId }).where(eq(schema.review.userId, userId));
        await tx.update(schema.comment).set({ userId: ghostId }).where(eq(schema.comment.userId, userId));
        await tx.update(schema.thread).set({ userId: ghostId }).where(eq(schema.thread.userId, userId));
      }
      // Sessions and sign-in accounts cascade; orders are set null by their foreign key.
      await tx.delete(schema.user).where(eq(schema.user.id, userId));
    });
  } catch (e) {
    console.error("[account] delete failed", e instanceof Error ? e.message : e);
    return { ok: false, error: "FAILED" };
  }
  // No email in the trail: the person asked to be forgotten.
  await audit({ user: { id: userId, email: "(self)" } }, "user.self_delete", { type: "user", id: userId }, { keepContent });
  revalidatePath("/", "layout");
  return { ok: true };
}
