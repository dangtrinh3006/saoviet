import "server-only";
import { and, desc, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { listAudit } from "./audit";

/** Everything an admin needs on one user's page; null when the id does not exist. */
export async function adminUserDetail(id: string) {
  await requireAdmin();
  const [u] = await db.select().from(schema.user).where(eq(schema.user.id, id)).limit(1);
  if (!u) return null;
  const now = new Date();
  const [accounts, sessions, orders, reviews, comments, history] = await Promise.all([
    db.select({ providerId: schema.account.providerId }).from(schema.account).where(eq(schema.account.userId, id)),
    db
      .select({ lastActive: schema.session.updatedAt })
      .from(schema.session)
      .where(and(eq(schema.session.userId, id), gt(schema.session.expiresAt, now))),
    db
      .select({ id: schema.order.id, code: schema.order.code, tourSlug: schema.order.tourSlug, status: schema.order.status, totalVnd: schema.order.totalVnd, departureDate: schema.order.departureDate, createdAt: schema.order.createdAt })
      .from(schema.order)
      .where(eq(schema.order.userId, id))
      .orderBy(desc(schema.order.createdAt))
      .limit(50),
    db
      .select({ id: schema.review.id, tourSlug: schema.review.tourSlug, rating: schema.review.rating, body: schema.review.body, hidden: schema.review.hidden, createdAt: schema.review.createdAt })
      .from(schema.review)
      .where(eq(schema.review.userId, id))
      .orderBy(desc(schema.review.createdAt))
      .limit(50),
    db
      .select({ id: schema.comment.id, targetId: schema.comment.targetId, body: schema.comment.body, hidden: schema.comment.hidden, createdAt: schema.comment.createdAt })
      .from(schema.comment)
      .where(eq(schema.comment.userId, id))
      .orderBy(desc(schema.comment.createdAt))
      .limit(50),
    listAudit({ targetType: "user", targetId: id, limit: 50 }),
  ]);
  const lastActive = sessions.reduce<Date | null>((a, s) => (!a || s.lastActive > a ? s.lastActive : a), null);
  return {
    user: u,
    providers: [...new Set(accounts.map((a) => a.providerId))],
    activeSessions: sessions.length,
    lastActive,
    orders,
    reviews,
    comments,
    history,
  };
}
