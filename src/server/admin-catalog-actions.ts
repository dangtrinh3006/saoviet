"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { type FieldErrors, parseChangeRequest, parseTour, SLUG_RE, TOUR_STATUSES, type TourData, type TourStatus } from "@/lib/catalog-schema";

export type CatalogResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: "VALIDATION" | "SLUG_TAKEN" | "CODE_TAKEN" | "NOT_FOUND" | "HAS_ORDERS" | "FAILED"; fieldErrors?: FieldErrors };

function revalidateCatalog(slug?: string) {
  revalidatePath("/[locale]", "layout");
  revalidatePath("/[locale]/tours", "page");
  revalidatePath("/[locale]/map", "page");
  revalidatePath("/[locale]/admin/tours", "page");
  if (slug) {
    revalidatePath("/[locale]/tours/[slug]", "page");
    revalidatePath("/[locale]/admin/tours/[slug]/edit", "page");
  }
}

const validSlug = (slug: unknown): slug is string => typeof slug === "string" && slug.length <= 80 && SLUG_RE.test(slug);

async function codeTaken(code: string, exceptSlug?: string) {
  const where = exceptSlug ? and(eq(schema.tour.code, code), ne(schema.tour.slug, exceptSlug)) : eq(schema.tour.code, code);
  const rows = await db.select({ slug: schema.tour.slug }).from(schema.tour).where(where).limit(1);
  return rows.length > 0;
}

const columns = (d: TourData) => ({
  code: d.code,
  title: d.title,
  tagline: d.tagline,
  locationSlug: d.locationSlug,
  nights: d.nights,
  difficulty: d.difficulty,
  priceVnd: d.priceVnd,
  maxGuests: d.maxGuests,
  highlights: d.highlights,
  itinerary: d.itinerary,
  includes: d.includes,
  image: d.image,
  featured: d.featured,
  status: d.status,
  sortOrder: d.sortOrder,
});

export async function createTour(input: unknown): Promise<CatalogResult<{ slug: string }>> {
  await requireAdmin();
  const parsed = parseTour(input);
  if (!parsed.ok) return { ok: false, error: "VALIDATION", fieldErrors: parsed.errors };
  const d = parsed.data;
  const [existing] = await db.select({ slug: schema.tour.slug }).from(schema.tour).where(eq(schema.tour.slug, d.slug)).limit(1);
  if (existing) return { ok: false, error: "SLUG_TAKEN", fieldErrors: { slug: "slugTaken" } };
  if (await codeTaken(d.code)) return { ok: false, error: "CODE_TAKEN", fieldErrors: { code: "codeTaken" } };
  // The PK still guards a concurrent create that slipped past the check above.
  const rows = await db.insert(schema.tour).values({ slug: d.slug, ...columns(d) }).onConflictDoNothing().returning({ slug: schema.tour.slug });
  if (rows.length === 0) return { ok: false, error: "SLUG_TAKEN", fieldErrors: { slug: "slugTaken" } };
  revalidateCatalog(d.slug);
  return { ok: true, data: { slug: d.slug } };
}

/** The slug is the primary key and orders reference it, so it never changes on update. */
export async function updateTour(slug: string, input: unknown): Promise<CatalogResult> {
  await requireAdmin();
  if (!validSlug(slug)) return { ok: false, error: "NOT_FOUND" };
  const parsed = parseTour({ ...(input as object), slug });
  if (!parsed.ok) return { ok: false, error: "VALIDATION", fieldErrors: parsed.errors };
  if (await codeTaken(parsed.data.code, slug)) return { ok: false, error: "CODE_TAKEN", fieldErrors: { code: "codeTaken" } };
  const rows = await db
    .update(schema.tour)
    .set({ ...columns(parsed.data), updatedAt: new Date() })
    .where(eq(schema.tour.slug, slug))
    .returning({ slug: schema.tour.slug });
  if (rows.length === 0) return { ok: false, error: "NOT_FOUND" };
  revalidateCatalog(slug);
  return { ok: true };
}

/** Copies a tour as a draft with a free slug and code, so it can be edited before going live. */
export async function duplicateTour(slug: string): Promise<CatalogResult<{ slug: string }>> {
  await requireAdmin();
  if (!validSlug(slug)) return { ok: false, error: "NOT_FOUND" };
  const [src] = await db.select().from(schema.tour).where(eq(schema.tour.slug, slug)).limit(1);
  if (!src) return { ok: false, error: "NOT_FOUND" };

  const all = await db.select({ slug: schema.tour.slug, code: schema.tour.code }).from(schema.tour);
  const slugs = new Set(all.map((r) => r.slug));
  const base = `${src.slug.slice(0, 72)}-copy`;
  let newSlug = base;
  for (let i = 2; slugs.has(newSlug); i++) newSlug = `${base}-${i}`;
  const maxCode = Math.max(0, ...all.map((r) => Number(/^SV-(\d+)$/.exec(r.code)?.[1] ?? 0)));
  const code = `SV-${String(maxCode + 1).padStart(2, "0")}`;

  const { createdAt: _c, updatedAt: _u, ...rest } = src;
  void _c;
  void _u;
  await db.insert(schema.tour).values({
    ...rest,
    slug: newSlug,
    code,
    title: { vi: `${src.title.vi} (bản sao)`.slice(0, 120), en: `${src.title.en} (copy)`.slice(0, 120) },
    status: "draft",
    featured: false,
  });
  revalidateCatalog();
  return { ok: true, data: { slug: newSlug } };
}

export async function setTourStatus(slug: string, status: TourStatus): Promise<CatalogResult> {
  await requireAdmin();
  if (!validSlug(slug) || !TOUR_STATUSES.includes(status)) return { ok: false, error: "VALIDATION" };
  const rows = await db
    .update(schema.tour)
    .set({ status, updatedAt: new Date(), ...(status === "archived" ? { featured: false } : {}) })
    .where(eq(schema.tour.slug, slug))
    .returning({ slug: schema.tour.slug });
  if (rows.length === 0) return { ok: false, error: "NOT_FOUND" };
  revalidateCatalog(slug);
  return { ok: true };
}

/** Hard delete only when nothing references the slug; otherwise archive (orders keep their price snapshot). */
export async function deleteTour(slug: string): Promise<CatalogResult> {
  await requireAdmin();
  if (!validSlug(slug)) return { ok: false, error: "NOT_FOUND" };
  const [ord] = await db.select({ id: schema.order.id }).from(schema.order).where(eq(schema.order.tourSlug, slug)).limit(1);
  const [rev] = await db.select({ id: schema.review.id }).from(schema.review).where(eq(schema.review.tourSlug, slug)).limit(1);
  if (ord || rev) return { ok: false, error: "HAS_ORDERS" };
  const rows = await db.delete(schema.tour).where(eq(schema.tour.slug, slug)).returning({ slug: schema.tour.slug });
  if (rows.length === 0) return { ok: false, error: "NOT_FOUND" };
  revalidateCatalog(slug);
  return { ok: true };
}

/** Queues work an admin cannot do online (new site, 3D scene, 360° photo) for developers. */
export async function createChangeRequest(input: unknown): Promise<CatalogResult<{ id: string }>> {
  const session = await requireAdmin();
  const parsed = parseChangeRequest(input);
  if (!parsed.ok) return { ok: false, error: "VALIDATION", fieldErrors: parsed.errors };
  const d = parsed.data;
  const tourSlug = d.tourSlug && validSlug(d.tourSlug) ? d.tourSlug : undefined;
  const payload: Record<string, unknown> = d.kind === "location" ? { location: d.location } : {};
  if (tourSlug) payload.tourSlug = tourSlug;
  const details = d.kind === "location" && d.details === "" ? d.location.notes : d.details;
  const id = crypto.randomUUID();
  await db.insert(schema.changeRequest).values({
    id,
    kind: d.kind,
    title: d.title,
    details,
    payload: Object.keys(payload).length ? payload : null,
    createdBy: session.user.id,
  });
  revalidatePath("/[locale]/admin", "layout");
  return { ok: true, data: { id } };
}
