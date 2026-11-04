import "server-only";
import { and, avg, count, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";

const author = { name: schema.user.name, image: schema.user.image };

export async function reviewsForTour(tourSlug: string) {
  const rows = await db
    .select({ id: schema.review.id, rating: schema.review.rating, body: schema.review.body, createdAt: schema.review.createdAt, userId: schema.review.userId, author })
    .from(schema.review)
    .innerJoin(schema.user, eq(schema.user.id, schema.review.userId))
    .where(and(eq(schema.review.tourSlug, tourSlug), eq(schema.review.hidden, false)))
    .orderBy(desc(schema.review.createdAt));
  const average = rows.length ? rows.reduce((a, r) => a + r.rating, 0) / rows.length : null;
  return { rows, average };
}

export async function ratingSummary() {
  const rows = await db
    .select({ tourSlug: schema.review.tourSlug, average: avg(schema.review.rating), total: count() })
    .from(schema.review)
    .where(eq(schema.review.hidden, false))
    .groupBy(schema.review.tourSlug);
  return Object.fromEntries(rows.map((r) => [r.tourSlug, { average: Number(r.average), total: r.total }]));
}

export async function commentsFor(targetType: "post" | "thread", targetId: string) {
  return db
    .select({ id: schema.comment.id, body: schema.comment.body, createdAt: schema.comment.createdAt, author })
    .from(schema.comment)
    .innerJoin(schema.user, eq(schema.user.id, schema.comment.userId))
    .where(and(eq(schema.comment.targetType, targetType), eq(schema.comment.targetId, targetId), eq(schema.comment.hidden, false)))
    .orderBy(schema.comment.createdAt);
}

export async function listThreads(category?: string) {
  const replies = db
    .select({ targetId: schema.comment.targetId, n: count().as("n") })
    .from(schema.comment)
    .where(and(eq(schema.comment.targetType, "thread"), eq(schema.comment.hidden, false)))
    .groupBy(schema.comment.targetId)
    .as("replies");
  return db
    .select({
      id: schema.thread.id,
      slug: schema.thread.slug,
      title: schema.thread.title,
      category: schema.thread.category,
      pinned: schema.thread.pinned,
      createdAt: schema.thread.createdAt,
      author,
      replies: sql<number>`coalesce(${replies.n}, 0)`.mapWith(Number),
    })
    .from(schema.thread)
    .innerJoin(schema.user, eq(schema.user.id, schema.thread.userId))
    .leftJoin(replies, eq(replies.targetId, schema.thread.slug))
    .where(and(eq(schema.thread.hidden, false), category ? eq(schema.thread.category, category) : undefined))
    .orderBy(desc(schema.thread.pinned), desc(schema.thread.createdAt));
}

export async function threadBySlug(slug: string) {
  const [row] = await db
    .select({ thread: schema.thread, author })
    .from(schema.thread)
    .innerJoin(schema.user, eq(schema.user.id, schema.thread.userId))
    .where(and(eq(schema.thread.slug, slug), eq(schema.thread.hidden, false)));
  return row ?? null;
}

export async function ordersForUser(userId: string) {
  return db.select().from(schema.order).where(eq(schema.order.userId, userId)).orderBy(desc(schema.order.createdAt));
}

export async function adminOverview() {
  const [orders, users, reviews, comments, threads] = await Promise.all([
    db.select().from(schema.order).orderBy(desc(schema.order.createdAt)).limit(200),
    db.select({ id: schema.user.id, name: schema.user.name, email: schema.user.email, role: schema.user.role, banned: schema.user.banned, createdAt: schema.user.createdAt }).from(schema.user).orderBy(desc(schema.user.createdAt)).limit(200),
    db.select({ id: schema.review.id, body: schema.review.body, rating: schema.review.rating, hidden: schema.review.hidden, target: schema.review.tourSlug, createdAt: schema.review.createdAt, author }).from(schema.review).innerJoin(schema.user, eq(schema.user.id, schema.review.userId)).orderBy(desc(schema.review.createdAt)).limit(100),
    db.select({ id: schema.comment.id, body: schema.comment.body, hidden: schema.comment.hidden, target: schema.comment.targetId, createdAt: schema.comment.createdAt, author }).from(schema.comment).innerJoin(schema.user, eq(schema.user.id, schema.comment.userId)).orderBy(desc(schema.comment.createdAt)).limit(100),
    db.select({ id: schema.thread.id, body: schema.thread.title, hidden: schema.thread.hidden, target: schema.thread.slug, createdAt: schema.thread.createdAt, author }).from(schema.thread).innerJoin(schema.user, eq(schema.user.id, schema.thread.userId)).orderBy(desc(schema.thread.createdAt)).limit(100),
  ]);
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((a, o) => a + o.totalVnd, 0);
  return { orders, users, reviews, comments, threads, revenue };
}
