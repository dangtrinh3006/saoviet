"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { db, schema } from "@/db";
import { checkBanChange, checkRoleChange, type GuardError, type Role } from "@/lib/admin-guards";
import { auth, requireAdmin } from "@/lib/auth";
import { audit } from "./audit";

export type UserActionResult = { ok: true } | { ok: false; error: GuardError | "INVALID_INPUT" | "NOT_FOUND" | "FAILED" };

const userId = z.string().min(1).max(200);
const role = z.enum(["user", "admin"]);
const reason = z.string().trim().max(300).optional();

async function loadTarget(id: string) {
  const [row] = await db
    .select({ id: schema.user.id, role: schema.user.role, banned: schema.user.banned })
    .from(schema.user)
    .where(eq(schema.user.id, id))
    .limit(1);
  return row ? { ...row, role: (row.role === "admin" ? "admin" : "user") as Role, banned: Boolean(row.banned) } : null;
}

async function adminCount() {
  const [row] = await db.select({ n: count() }).from(schema.user).where(eq(schema.user.role, "admin"));
  return row?.n ?? 0;
}

const refresh = (id: string) => {
  revalidatePath("/[locale]/admin", "layout");
  revalidatePath(`/[locale]/admin/users/${id}`, "page");
};

export async function adminSetRole(targetId: string, nextRole: Role): Promise<UserActionResult> {
  const admin = await requireAdmin();
  const id = userId.safeParse(targetId);
  const r = role.safeParse(nextRole);
  if (!id.success || !r.success) return { ok: false, error: "INVALID_INPUT" };
  const target = await loadTarget(id.data);
  if (!target) return { ok: false, error: "NOT_FOUND" };
  const blocked = checkRoleChange({ actorId: admin.user.id, targetId: target.id, adminCount: await adminCount(), currentRole: target.role, nextRole: r.data });
  if (blocked) return { ok: false, error: blocked };
  try {
    await auth.api.setRole({ body: { userId: target.id, role: r.data }, headers: await headers() });
  } catch {
    return { ok: false, error: "FAILED" };
  }
  await audit(admin, "user.role", { type: "user", id: target.id }, { from: target.role, to: r.data });
  refresh(target.id);
  return { ok: true };
}

/** Banning also signs the user out everywhere (Better Auth deletes their sessions). */
export async function adminSetBan(targetId: string, nextBanned: boolean, banReason?: string): Promise<UserActionResult> {
  const admin = await requireAdmin();
  const id = userId.safeParse(targetId);
  const why = reason.safeParse(banReason);
  if (!id.success || !why.success) return { ok: false, error: "INVALID_INPUT" };
  const target = await loadTarget(id.data);
  if (!target) return { ok: false, error: "NOT_FOUND" };
  const blocked = checkBanChange({ actorId: admin.user.id, targetId: target.id, adminCount: 0, targetRole: target.role, banned: target.banned, nextBanned });
  if (blocked) return { ok: false, error: blocked };
  try {
    const h = await headers();
    if (nextBanned) await auth.api.banUser({ body: { userId: target.id, banReason: why.data || undefined }, headers: h });
    else await auth.api.unbanUser({ body: { userId: target.id }, headers: h });
  } catch {
    return { ok: false, error: "FAILED" };
  }
  await audit(admin, nextBanned ? "user.ban" : "user.unban", { type: "user", id: target.id }, why.data ? { reason: why.data } : undefined);
  refresh(target.id);
  return { ok: true };
}
