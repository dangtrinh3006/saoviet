import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

export type TourRow = typeof schema.tour.$inferSelect;

/** Every tour in every status. Callers must have checked the admin role already. */
export async function listAllTours(): Promise<TourRow[]> {
  return db.select().from(schema.tour).orderBy(asc(schema.tour.sortOrder), asc(schema.tour.code));
}

export async function getTourRow(slug: string): Promise<TourRow | undefined> {
  const [row] = await db.select().from(schema.tour).where(eq(schema.tour.slug, slug)).limit(1);
  return row;
}

/** Next free SV-nn code, suggested on the create form. */
export async function nextTourCode(): Promise<string> {
  const rows = await db.select({ code: schema.tour.code }).from(schema.tour);
  const max = Math.max(0, ...rows.map((r) => Number(/^SV-(\d+)$/.exec(r.code)?.[1] ?? 0)));
  return `SV-${String(max + 1).padStart(2, "0")}`;
}
