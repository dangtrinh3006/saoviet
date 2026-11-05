import "server-only";
import { asc, eq } from "drizzle-orm";
import { services as staticServices } from "@/content/services";
import { tours as staticTours } from "@/content/tours";
import type { ImageRef, Service, Tour } from "@/content/types";
import { db, schema } from "@/db";

type TourRow = typeof schema.tour.$inferSelect;
type ServiceRow = typeof schema.service.$inferSelect;

const NO_IMAGE: ImageRef = { src: "", alt: { vi: "", en: "" }, credit: "TBD", license: "TBD", sourceUrl: "" };

export const toTour = (r: TourRow): Tour & { status: TourRow["status"] } => ({
  slug: r.slug,
  code: r.code,
  title: r.title,
  tagline: r.tagline,
  locationSlug: r.locationSlug,
  nights: r.nights,
  difficulty: r.difficulty,
  priceVnd: r.priceVnd,
  maxGuests: r.maxGuests,
  highlights: r.highlights,
  itinerary: r.itinerary,
  includes: r.includes,
  image: r.image ?? NO_IMAGE,
  featured: r.featured,
  status: r.status,
});

export const toService = (r: ServiceRow): Service & { status: ServiceRow["status"] } => ({
  slug: r.slug,
  icon: r.icon,
  title: r.title,
  body: r.body,
  fromVnd: r.fromVnd,
  status: r.status,
});

/**
 * Published catalogue for public pages. Falls back to the bundled content when the
 * table is empty or the DB is unreachable, so a DB outage never blanks the site.
 */
export async function listTours(): Promise<Tour[]> {
  try {
    const rows = await db.select().from(schema.tour).orderBy(asc(schema.tour.sortOrder), asc(schema.tour.code));
    if (rows.length === 0) return staticTours;
    return rows.filter((r) => r.status === "published").map(toTour);
  } catch {
    return staticTours;
  }
}

export async function getTour(slug: string): Promise<Tour | undefined> {
  try {
    const [row] = await db.select().from(schema.tour).where(eq(schema.tour.slug, slug));
    if (row) return row.status === "published" ? toTour(row) : undefined;
    const any = await db.select({ slug: schema.tour.slug }).from(schema.tour).limit(1);
    return any.length === 0 ? staticTours.find((t) => t.slug === slug) : undefined;
  } catch {
    return staticTours.find((t) => t.slug === slug);
  }
}

/** Any status — for admin screens and for labelling historical orders. */
export async function getTourAnyStatus(slug: string): Promise<Tour | undefined> {
  try {
    const [row] = await db.select().from(schema.tour).where(eq(schema.tour.slug, slug));
    return row ? toTour(row) : staticTours.find((t) => t.slug === slug);
  } catch {
    return staticTours.find((t) => t.slug === slug);
  }
}

export async function listServices(): Promise<Service[]> {
  try {
    const rows = await db.select().from(schema.service).orderBy(asc(schema.service.sortOrder));
    if (rows.length === 0) return staticServices;
    return rows.filter((r) => r.status === "published").map(toService);
  } catch {
    return staticServices;
  }
}

/** Lookup of every tour regardless of status, for labelling orders in account/admin. */
export async function tourLookup(): Promise<Map<string, Tour>> {
  const map = new Map<string, Tour>(staticTours.map((t) => [t.slug, t]));
  try {
    for (const r of await db.select().from(schema.tour)) map.set(r.slug, toTour(r));
  } catch {
    // Static titles are good enough for labels when the DB is down.
  }
  return map;
}
