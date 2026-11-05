// Copies the bundled tours/services into the DB once (existing rows are left untouched),
// so admins edit the catalogue from then on. Run: npx tsx scripts/seed-catalog.ts
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { services } from "../src/content/services";
import { tours } from "../src/content/tours";
import * as schema from "../src/db/schema";

config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const db = drizzle(client, { schema });

const tourRows = tours.map((t, i) => ({
  slug: t.slug,
  code: t.code,
  title: t.title,
  tagline: t.tagline,
  locationSlug: t.locationSlug,
  nights: t.nights,
  difficulty: t.difficulty,
  priceVnd: t.priceVnd,
  maxGuests: t.maxGuests,
  highlights: t.highlights,
  itinerary: t.itinerary,
  includes: t.includes,
  image: t.image.license === "TBD" ? null : t.image,
  featured: Boolean(t.featured),
  status: "published" as const,
  sortOrder: i,
}));

const serviceRows = services.map((s, i) => ({ ...s, status: "published" as const, sortOrder: i }));

async function main() {
  const t = await db.insert(schema.tour).values(tourRows).onConflictDoNothing().returning({ slug: schema.tour.slug });
  const s = await db.insert(schema.service).values(serviceRows).onConflictDoNothing().returning({ slug: schema.service.slug });
  console.log(`catalog seeded: ${t.length} tours, ${s.length} services (existing rows kept)`);
  await client.end();
}

main();
