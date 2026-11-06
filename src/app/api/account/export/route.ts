import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { buildExport } from "@/lib/account-data";
import { getFreshSession } from "@/lib/auth";

// Personal data must never sit in a shared cache.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getFreshSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const id = session.user.id;
  const [[user], accounts, sessions, orders, reviews, comments, threads] = await Promise.all([
    db.select().from(schema.user).where(eq(schema.user.id, id)).limit(1),
    db.select().from(schema.account).where(eq(schema.account.userId, id)),
    db.select().from(schema.session).where(eq(schema.session.userId, id)),
    db.select().from(schema.order).where(eq(schema.order.userId, id)),
    db.select().from(schema.review).where(eq(schema.review.userId, id)),
    db.select().from(schema.comment).where(eq(schema.comment.userId, id)),
    db.select().from(schema.thread).where(eq(schema.thread.userId, id)),
  ]);
  if (!user) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const body = buildExport({ user, accounts, sessions, orders, reviews, comments, threads, exportedAt: new Date() });
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="saoviet-du-lieu-${day}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
