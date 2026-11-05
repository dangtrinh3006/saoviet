import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  bboxAround,
  commonsPanoramas,
  commonsGeosearchUrl,
  commonsPano360SearchUrl,
  mapillaryQueryUrl,
  nearestMapillary,
  type PanoramaApiResponse,
  type StreetPano,
} from "@/lib/panorama-sources";

// Street-level imagery changes slowly; one upstream lookup per point per day.
const REVALIDATE = 86400;
const TIMEOUT_MS = 8000;
// Wikimedia asks API clients for a descriptive User-Agent with contact info.
const USER_AGENT = `SaoViet/0.1 (${process.env.NEXT_PUBLIC_SITE_URL ?? "https://saoviet.vn"}; panorama lookup)`;
// Expand only if the tight box is empty: big Mapillary bboxes are slow and may be rejected.
const MAPILLARY_RADII_KM = [2, 5];

const Query = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

// Rounded to ~11 m so near-identical requests share one cache entry.
const round = (v: number) => Math.round(v * 1e4) / 1e4;

async function getJson(url: string, headers: Record<string, string>) {
  const res = await fetch(url, { headers, next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as unknown;
}

async function findMapillary(lat: number, lng: number, token: string): Promise<StreetPano | null> {
  for (const r of MAPILLARY_RADII_KM) {
    // Header auth keeps the token out of URLs and access logs.
    const body = await getJson(mapillaryQueryUrl(bboxAround(lat, lng, r)), { Authorization: `OAuth ${token}` });
    const hit = nearestMapillary(body, lat, lng);
    if (hit) return hit;
  }
  return null;
}

async function findCommons(lat: number, lng: number): Promise<StreetPano | null> {
  const headers = { "User-Agent": USER_AGENT, Accept: "application/json" };
  // Either query alone is enough; fail only when both do.
  const results = await Promise.allSettled([getJson(commonsPano360SearchUrl(lat, lng), headers), getJson(commonsGeosearchUrl(lat, lng), headers)]);
  const ok = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  if (!ok.length) throw (results[0] as PromiseRejectedResult).reason;
  return commonsPanoramas(ok, lat, lng)[0] ?? null;
}

const reason = (e: unknown) => (e instanceof Error ? e.message : String(e));

export async function GET(req: NextRequest) {
  const parsed = Query.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "lat and lng are required numbers" }, { status: 400 });
  const lat = round(parsed.data.lat);
  const lng = round(parsed.data.lng);
  const token = process.env.MAPILLARY_TOKEN;

  const [mly, cms] = await Promise.allSettled([token ? findMapillary(lat, lng, token) : Promise.resolve(null), findCommons(lat, lng)]);
  const body: PanoramaApiResponse = {
    mapillary: mly.status === "fulfilled" ? mly.value : null,
    commons: cms.status === "fulfilled" ? cms.value : null,
  };
  const errors: PanoramaApiResponse["errors"] = {};
  // Upstream detail is logged server-side only; the client just needs to know a source failed.
  if (mly.status === "rejected") {
    console.warn("[panorama] mapillary:", reason(mly.reason));
    errors.mapillary = "unavailable";
  }
  if (cms.status === "rejected") {
    console.warn("[panorama] commons:", reason(cms.reason));
    errors.commons = "unavailable";
  }
  if (Object.keys(errors).length) body.errors = errors;

  // Failures are cached briefly so a transient outage does not stick for a day.
  const maxAge = body.errors ? 300 : REVALIDATE;
  return NextResponse.json(body, {
    headers: { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}` },
  });
}
