// Pure helpers for street-level 360° sources; no I/O so they run in tests, the route and the client.

export type PanoSource = "streetview" | "mapillary" | "commons" | "sky";

export interface StreetPano {
  source: "mapillary" | "commons";
  /** Equirectangular image URL (2:1). */
  src: string;
  lat: number;
  lng: number;
  distanceKm: number;
  /** Plain-text author name; empty when the provider has none. */
  author: string;
  authorUrl?: string;
  license: string;
  licenseUrl?: string;
  /** Page for the image on the provider's site. */
  pageUrl: string;
  title?: string;
  capturedAt?: string;
}

export interface PanoramaApiResponse {
  mapillary: StreetPano | null;
  commons: StreetPano | null;
  /** Per-source failure reason; a missing source is not an error. */
  errors?: Partial<Record<"mapillary" | "commons", string>>;
}

export type BBox = [minLng: number, minLat: number, maxLng: number, maxLat: number];

const EARTH_KM = 6371.0088;
const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Square bbox of half-side `radiusKm` around a point, clamped to valid lat/lng (Mapillary order). */
export function bboxAround(lat: number, lng: number, radiusKm: number): BBox {
  const dLat = radiusKm / 111.32;
  // Longitude degrees shrink with cos(lat); floor the cosine so polar boxes stay finite.
  const dLng = radiusKm / (111.32 * Math.max(Math.cos(toRad(lat)), 0.01));
  const r = (v: number) => Math.round(v * 1e6) / 1e6;
  return [r(Math.max(-180, lng - dLng)), r(Math.max(-90, lat - dLat)), r(Math.min(180, lng + dLng)), r(Math.min(90, lat + dLat))];
}

export function pickNearest<T extends { lat: number; lng: number }>(items: T[], lat: number, lng: number) {
  let best: (T & { distanceKm: number }) | null = null;
  for (const it of items) {
    if (!Number.isFinite(it.lat) || !Number.isFinite(it.lng)) continue;
    const d = haversineKm(lat, lng, it.lat, it.lng);
    if (!best || d < best.distanceKm) best = { ...it, distanceKm: d };
  }
  return best;
}

const stripHtml = (s: string) =>
  s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

/* ---------------- Mapillary ---------------- */

export interface MapillaryImage {
  id: string;
  is_pano?: boolean;
  thumb_1024_url?: string;
  thumb_2048_url?: string;
  computed_geometry?: { type: string; coordinates: [number, number] };
  geometry?: { type: string; coordinates: [number, number] };
  captured_at?: number;
  creator?: { id?: string; username?: string };
}

export const MAPILLARY_FIELDS = "id,is_pano,thumb_1024_url,thumb_2048_url,computed_geometry,geometry,captured_at,creator";

export function mapillaryQueryUrl(box: BBox, limit = 200) {
  const q = new URLSearchParams({ fields: MAPILLARY_FIELDS, is_pano: "true", bbox: box.join(","), limit: String(limit) });
  return `https://graph.mapillary.com/images?${q}`;
}

/** Nearest panoramic image from a Graph API `images` response, or null for anything malformed. */
export function nearestMapillary(body: unknown, lat: number, lng: number): StreetPano | null {
  const data = (body as { data?: unknown })?.data;
  if (!Array.isArray(data)) return null;
  const candidates = (data as MapillaryImage[])
    .filter((im) => im && typeof im.id === "string" && im.is_pano !== false && (im.thumb_2048_url || im.thumb_1024_url))
    .map((im) => {
      const c = im.computed_geometry?.coordinates ?? im.geometry?.coordinates;
      return { im, lng: Number(c?.[0]), lat: Number(c?.[1]) };
    });
  const best = pickNearest(candidates, lat, lng);
  if (!best) return null;
  const { im } = best;
  const user = im.creator?.username;
  return {
    source: "mapillary",
    src: (im.thumb_2048_url ?? im.thumb_1024_url)!,
    lat: best.lat,
    lng: best.lng,
    distanceKm: best.distanceKm,
    author: user ?? "",
    authorUrl: user ? `https://www.mapillary.com/profile/${encodeURIComponent(user)}` : undefined,
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    pageUrl: `https://www.mapillary.com/app/?pKey=${encodeURIComponent(im.id)}&focus=photo`,
    capturedAt: typeof im.captured_at === "number" ? new Date(im.captured_at).toISOString() : undefined,
  };
}

/* ---------------- Wikimedia Commons ---------------- */

export interface CommonsPage {
  pageid?: number;
  title?: string;
  coordinates?: { lat: number; lon: number }[];
  categories?: { title: string }[];
  imageinfo?: {
    width?: number;
    height?: number;
    mime?: string;
    url?: string;
    thumburl?: string;
    descriptionurl?: string;
    extmetadata?: Record<string, { value?: string } | undefined>;
  }[];
}

const PANO_CATEGORY = /360°|360 degree|equirectangular|spherical panorama|pano360/i;

/** Equirectangular 360° test: 2:1 within 1% (stitchers round sizes), or tagged as a 360° panorama. */
export function isEquirectangular(width: number | undefined, height: number | undefined, categories: string[] = []) {
  if (!width || !height || width < 1000) return false;
  const ratio = width / height;
  if (Math.abs(ratio - 2) <= 0.02) return true;
  // A category alone is not enough for odd ratios: cropped "panoramas" are often tagged too.
  return categories.some((c) => PANO_CATEGORY.test(c)) && Math.abs(ratio - 2) <= 0.05;
}

export const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

const COMMONS_PROPS = {
  prop: "imageinfo|coordinates|categories",
  iiprop: "url|size|mime|extmetadata",
  iiurlwidth: "4096",
  iiextmetadatafilter: "LicenseShortName|LicenseUrl|Artist|ObjectName",
  cllimit: "max",
  format: "json",
  formatversion: "2",
};

/** Nearest 50 geotagged files within 10 km (the geosearch maximum); 2:1 is checked afterwards. */
export function commonsGeosearchUrl(lat: number, lng: number, radiusM = 10000) {
  const q = new URLSearchParams({
    action: "query",
    generator: "geosearch",
    ggscoord: `${lat}|${lng}`,
    ggsradius: String(Math.min(10000, radiusM)),
    ggsnamespace: "6",
    ggslimit: "50",
    ...COMMONS_PROPS,
  });
  return `${COMMONS_API}?${q}`;
}

/** Files tagged {{Pano360}} within `radiusKm`; reaches past the geosearch's 50-nearest cap in busy areas. */
export function commonsPano360SearchUrl(lat: number, lng: number, radiusKm = 25) {
  const q = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `nearcoord:${radiusKm}km,${lat},${lng} hastemplate:Pano360 filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "50",
    ...COMMONS_PROPS,
  });
  return `${COMMONS_API}?${q}`;
}

/** All 2:1 image files across one or more Commons query responses, deduplicated, nearest first. */
export function commonsPanoramas(bodies: unknown | unknown[], lat: number, lng: number): StreetPano[] {
  const pages = (Array.isArray(bodies) ? bodies : [bodies]).flatMap((b) => {
    const ps = (b as { query?: { pages?: unknown } })?.query?.pages;
    return Array.isArray(ps) ? (ps as CommonsPage[]) : [];
  });
  const seen = new Set<string>();
  const out: StreetPano[] = [];
  for (const p of pages) {
    const info = p?.imageinfo?.[0];
    const coord = p?.coordinates?.[0];
    if (!info || !coord || !info.url || seen.has(info.url)) continue;
    if (info.mime && !/^image\/(jpeg|png|webp)$/.test(info.mime)) continue;
    if (!isEquirectangular(info.width, info.height, (p.categories ?? []).map((c) => c.title))) continue;
    const meta = info.extmetadata ?? {};
    const license = stripHtml(meta.LicenseShortName?.value ?? "");
    // Without a stated license we cannot attribute it correctly, so skip.
    if (!license) continue;
    seen.add(info.url);
    out.push({
      source: "commons",
      src: info.thumburl ?? info.url,
      lat: coord.lat,
      lng: coord.lon,
      distanceKm: haversineKm(lat, lng, coord.lat, coord.lon),
      author: stripHtml(meta.Artist?.value ?? "") || "Wikimedia Commons",
      license,
      licenseUrl: meta.LicenseUrl?.value || undefined,
      pageUrl: info.descriptionurl ?? `https://commons.wikimedia.org/?curid=${p.pageid}`,
      title: stripHtml(meta.ObjectName?.value ?? "") || p.title?.replace(/^File:/, "").replace(/\.\w+$/, ""),
    });
  }
  return out.sort((a, b) => a.distanceKm - b.distanceKm);
}

/* ---------------- Google Street View (Maps Embed API) ---------------- */

// Embed only shows imagery right at `location` (no radius), so remote sites need a pre-resolved pano id.
export function streetViewEmbedUrl(
  key: string,
  lat: number,
  lng: number,
  opts: { pano?: string; heading?: number; pitch?: number; fov?: number; language?: string } = {},
) {
  const q = new URLSearchParams({
    key,
    ...(opts.pano ? { pano: opts.pano } : { location: `${lat},${lng}` }),
    heading: String(opts.heading ?? 0),
    pitch: String(opts.pitch ?? 10),
    fov: String(Math.min(100, Math.max(10, opts.fov ?? 90))),
  });
  if (opts.language) q.set("language", opts.language);
  return `https://www.google.com/maps/embed/v1/streetview?${q}`;
}
