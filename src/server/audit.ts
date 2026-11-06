import "server-only";
import { desc, eq, and } from "drizzle-orm";
import { db, schema } from "@/db";

type Actor = { user: { id: string; email: string } };

/** Best effort: an audit write failure must not undo the admin action that already happened. */
export async function audit(actor: Actor, action: string, target: { type: string; id: string }, detail?: Record<string, unknown>) {
  try {
    await db.insert(schema.auditLog).values({
      id: crypto.randomUUID(),
      actorId: actor.user.id,
      actorEmail: actor.user.email,
      action,
      targetType: target.type,
      targetId: target.id,
      detail: detail ?? null,
    });
  } catch (e) {
    console.error("[audit] write failed", action, e instanceof Error ? e.message : e);
  }
}

export async function listAudit(opts: { targetType?: string; targetId?: string; limit?: number } = {}) {
  const where =
    opts.targetType && opts.targetId
      ? and(eq(schema.auditLog.targetType, opts.targetType), eq(schema.auditLog.targetId, opts.targetId))
      : undefined;
  return db
    .select()
    .from(schema.auditLog)
    .where(where)
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(Math.min(Math.max(1, opts.limit ?? 200), 500));
}
