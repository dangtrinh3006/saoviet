// Resolves the nearest Street View panorama for each location via the (free) metadata endpoint
// and writes pano ids to src/content/street-panos.json. Run: npx tsx scripts/find-street-panos.ts
import { writeFileSync } from "node:fs";
import { config } from "dotenv";
import { locations } from "../src/content/locations";
import { haversineKm } from "../src/lib/panorama-sources";

config({ path: ".env.local" });

const KEY = process.env.GOOGLE_SV_METADATA_KEY;
if (!KEY) throw new Error("GOOGLE_SV_METADATA_KEY missing in .env.local");

// Beyond this the "nearest" panorama shows a different place, which would mislead visitors.
const RADII_M = [1_000, 5_000, 15_000, 25_000];

type Meta = { status: string; pano_id?: string; location?: { lat: number; lng: number }; date?: string; copyright?: string };

async function metadata(lat: number, lng: number, radius: number): Promise<Meta> {
  const q = new URLSearchParams({ location: `${lat},${lng}`, radius: String(radius), key: KEY! });
  const res = await fetch(`https://maps.googleapis.com/maps/api/streetview/metadata?${q}`);
  return (await res.json()) as Meta;
}

async function main() {
  const out: Record<string, { pano: string; lat: number; lng: number; distanceKm: number; date?: string; copyright?: string }> = {};
  for (const l of locations) {
    let found: Meta | undefined;
    for (const r of RADII_M) {
      const m = await metadata(l.lat, l.lng, r);
      if (m.status === "REQUEST_DENIED") throw new Error(`metadata denied: ${JSON.stringify(m).replace(KEY!, "<key>")}`);
      if (m.status === "OK" && m.pano_id && m.location) {
        found = m;
        break;
      }
    }
    if (!found) {
      console.log(`${l.slug.padEnd(22)} none within ${RADII_M.at(-1)! / 1000} km`);
      continue;
    }
    const distanceKm = Math.round(haversineKm(l.lat, l.lng, found.location!.lat, found.location!.lng) * 10) / 10;
    out[l.slug] = { pano: found.pano_id!, lat: found.location!.lat, lng: found.location!.lng, distanceKm, date: found.date, copyright: found.copyright };
    console.log(`${l.slug.padEnd(22)} ${String(distanceKm).padStart(5)} km  ${found.date ?? "?"}  ${found.copyright ?? ""}`);
  }
  writeFileSync("src/content/street-panos.json", JSON.stringify(out, null, 2) + "\n");
  console.log(`\n${Object.keys(out).length}/${locations.length} locations have a panorama`);
}

main();
