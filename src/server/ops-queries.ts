import "server-only";
import { and, asc, count, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/db";
import { getFreshSession, requireAdmin } from "@/lib/auth";
import { likeEscape, PAGE_SIZE, type OrderFilters } from "@/lib/ops-schema";

const o = schema.order;

/** Page guard: layouts are not re-rendered on every navigation, so each page checks too. */
export async function adminPageSession() {
  const session = await getFreshSession();
  if (session?.user.role !== "admin") notFound();
  return session;
}

export const todayVn = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

export function addDays(isoDay: string, days: number) {
  const d = new Date(`${isoDay}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function orderWhere(f: OrderFilters): SQL | undefined {
  const parts: (SQL | undefined)[] = [];
  if (f.q) {
    const p = `%${likeEscape(f.q)}%`;
    parts.push(or(ilike(o.code, p), ilike(o.contactName, p), ilike(o.contactEmail, p), ilike(o.contactPhone, p)));
  }
  if (f.status) parts.push(eq(o.status, f.status));
  if (f.tour) parts.push(eq(o.tourSlug, f.tour));
  // departure_date is YYYY-MM-DD text, so string comparison is date order.
  if (f.from) parts.push(gte(o.departureDate, f.from));
  if (f.to) parts.push(lte(o.departureDate, f.to));
  return and(...parts);
}

const ORDER_BY = {
  created_desc: [desc(o.createdAt)],
  created_asc: [asc(o.createdAt)],
  departure_asc: [asc(o.departureDate), asc(o.createdAt)],
  departure_desc: [desc(o.departureDate), desc(o.createdAt)],
  total_desc: [desc(o.totalVnd), desc(o.createdAt)],
  total_asc: [asc(o.totalVnd), desc(o.createdAt)],
} as const;

export async function searchOrders(f: OrderFilters) {
  await requireAdmin();
  const where = orderWhere(f);
  const [{ total }] = await db.select({ total: count() }).from(o).where(where);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(f.page, pages);
  const rows = await db
    .select()
    .from(o)
    .where(where)
    .orderBy(...ORDER_BY[f.sort])
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
  return { rows, total, page, pages };
}

/** Every matching row for CSV export, capped so one request cannot dump an unbounded table. */
export async function exportOrders(f: OrderFilters, cap = 10_000) {
  await requireAdmin();
  return db.select().from(o).where(orderWhere(f)).orderBy(...ORDER_BY[f.sort]).limit(cap);
}

export async function getOrder(id: string) {
  await requireAdmin();
  const [row] = await db.select().from(o).where(eq(o.id, id)).limit(1);
  return row ?? null;
}

export async function dashboardStats() {
  await requireAdmin();
  const today = todayVn();
  const horizon = addDays(today, 14);
  const [byStatus, upcoming, openChanges, outbox] = await Promise.all([
    db.select({ status: o.status, n: count(), sum: sql<number>`coalesce(sum(${o.totalVnd}), 0)`.mapWith(Number) }).from(o).groupBy(o.status),
    db
      .select()
      .from(o)
      .where(and(gte(o.departureDate, today), lte(o.departureDate, horizon), sql`${o.status} <> 'cancelled'`))
      .orderBy(asc(o.departureDate))
      .limit(50),
    db.select({ n: count() }).from(schema.changeRequest).where(eq(schema.changeRequest.status, "open")),
    db
      .select({ id: schema.mailOutbox.id, to: schema.mailOutbox.to, subject: schema.mailOutbox.subject, status: schema.mailOutbox.status, createdAt: schema.mailOutbox.createdAt })
      .from(schema.mailOutbox)
      .orderBy(desc(schema.mailOutbox.createdAt))
      .limit(5),
  ]);
  const counts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  let revenue = 0;
  for (const r of byStatus) {
    counts[r.status] = r.n;
    if (r.status !== "cancelled") revenue += r.sum;
  }
  return { counts, revenue, upcoming, openChanges: openChanges[0]?.n ?? 0, outbox, today, horizon };
}

export async function openChangeCount() {
  try {
    const [row] = await db.select({ n: count() }).from(schema.changeRequest).where(eq(schema.changeRequest.status, "open"));
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}

export async function listServicesAdmin() {
  await requireAdmin();
  return db.select().from(schema.service).orderBy(asc(schema.service.sortOrder), asc(schema.service.slug));
}

export async function getServiceAdmin(slug: string) {
  await requireAdmin();
  const [row] = await db.select().from(schema.service).where(eq(schema.service.slug, slug)).limit(1);
  return row ?? null;
}

const STATUS_RANK = sql`case ${schema.changeRequest.status} when 'open' then 0 when 'in_progress' then 1 when 'done' then 2 else 3 end`;

export async function listChangeRequests(status?: (typeof schema.changeStatus.enumValues)[number]) {
  await requireAdmin();
  const cr = schema.changeRequest;
  return db
    .select({ row: cr, author: { name: schema.user.name, email: schema.user.email } })
    .from(cr)
    .leftJoin(schema.user, eq(schema.user.id, cr.createdBy))
    .where(status ? eq(cr.status, status) : undefined)
    .orderBy(STATUS_RANK, desc(cr.createdAt))
    .limit(500);
}

export async function getChangeRequest(id: string) {
  await requireAdmin();
  const cr = schema.changeRequest;
  const [row] = await db
    .select({ row: cr, author: { name: schema.user.name, email: schema.user.email } })
    .from(cr)
    .leftJoin(schema.user, eq(schema.user.id, cr.createdBy))
    .where(eq(cr.id, id))
    .limit(1);
  return row ?? null;
}
