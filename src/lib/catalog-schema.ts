import { z } from "zod";
import { locations } from "@/content/locations";
import type { ImageRef, L10n } from "@/content/types";

// Shared by the admin tour form and the server actions; issue messages are i18n keys
// under "admincatalog.errors".

export const TOUR_STATUSES = ["draft", "published", "archived"] as const;
export type TourStatus = (typeof TOUR_STATUSES)[number];
export const DIFFICULTIES = ["easy", "moderate", "hard"] as const;
export const CHANGE_KINDS = ["location", "3d", "panorama", "other"] as const;
export type ChangeKind = (typeof CHANGE_KINDS)[number];

/** Must mirror images.remotePatterns in next.config.ts, or next/image throws on public pages. */
export const isOptimizableImage = (src: string) => {
  if (src.startsWith("/")) return true;
  try {
    return (IMAGE_HOSTS as readonly string[]).includes(new URL(src).hostname);
  } catch {
    return false;
  }
};

export const IMAGE_HOSTS = ["upload.wikimedia.org", "images.unsplash.com", "images-assets.nasa.gov", "cdn.esahubble.org", "dl.polyhaven.org"] as const;

export const LIST_MAX = 20;
const LOCATION_SLUGS = new Set(locations.map((l) => l.slug));

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CODE_RE = /^SV-\d{2,3}$/;

/** Vietnamese-aware slug: strips tone marks and maps đ, so "Đà Lạt" → "da-lat". */
export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

const text = (max: number, min = 1) => z.string().trim().min(min, "required").max(max, "tooLong");
const l10n = (max: number) => z.object({ vi: text(max), en: text(max) });
// Form inputs arrive as strings; a blank one is "required", not a silent 0 (z.coerce would give 0).
const toNumber = (v: unknown) => (typeof v === "string" ? (v.trim() === "" ? undefined : Number(v)) : v);
const num = () => z.number({ error: (iss) => (iss.input === undefined ? "required" : "number") });
const int = (min: number, max: number) =>
  z.preprocess(toNumber, num().int("integer").min(min, "tooSmall").max(max, "tooLarge"));

const httpsUrl = z
  .string()
  .trim()
  .max(500, "tooLong")
  .refine((v) => {
    try {
      return new URL(v).protocol === "https:";
    } catch {
      return false;
    }
  }, "https");

// Any https URL, or a root-relative path for media bundled under /public. Hosts outside
// IMAGE_HOSTS are rendered without the Next image optimiser (see SkyPlate).
const imageSrc = z
  .string()
  .trim()
  .max(500, "tooLong")
  .refine((v) => {
    if (/^\/(?!\/)[\w\-./]+$/.test(v)) return !v.includes("..");
    try {
      const u = new URL(v);
      return u.protocol === "https:";
    } catch {
      return false;
    }
  }, "imageHost");

export const isImageSrcAllowed = (v: string) => imageSrc.safeParse(v).success;

const imageInput = z.object({
  src: imageSrc,
  alt: l10n(200),
  credit: text(120),
  license: text(60),
  sourceUrl: httpsUrl,
});

export const tourInput = z.object({
  slug: z.string().trim().min(3, "required").max(80, "tooLong").regex(SLUG_RE, "slug"),
  code: z.string().trim().regex(CODE_RE, "code"),
  title: l10n(120),
  tagline: l10n(240),
  locationSlug: z.string().refine((s) => LOCATION_SLUGS.has(s), "location"),
  nights: int(1, 30),
  difficulty: z.enum(DIFFICULTIES, { error: "required" }),
  priceVnd: int(0, 500_000_000),
  maxGuests: int(1, 50),
  featured: z.boolean(),
  status: z.enum(TOUR_STATUSES, { error: "required" }),
  sortOrder: int(-1000, 10_000),
  highlights: z.array(l10n(200)).max(LIST_MAX, "tooMany"),
  includes: z.array(l10n(200)).max(LIST_MAX, "tooMany"),
  itinerary: z.array(z.object({ title: l10n(120), body: l10n(2000) })).max(LIST_MAX, "tooMany"),
  // An empty src means "no photo yet": the public pages draw the generative sky instead.
  image: imageInput.nullable(),
});

export type TourData = z.output<typeof tourInput>;

/** Form state: numbers stay strings while typing; the schema coerces them. */
export type TourFormValues = {
  slug: string;
  code: string;
  title: L10n;
  tagline: L10n;
  locationSlug: string;
  nights: string;
  difficulty: (typeof DIFFICULTIES)[number];
  priceVnd: string;
  maxGuests: string;
  featured: boolean;
  status: TourStatus;
  sortOrder: string;
  highlights: L10n[];
  includes: L10n[];
  itinerary: { title: L10n; body: L10n }[];
  image: { src: string; alt: L10n; credit: string; license: string; sourceUrl: string };
};

const blank = (): L10n => ({ vi: "", en: "" });
const NO_IMAGE = { src: "", alt: blank(), credit: "", license: "", sourceUrl: "" };

export function emptyTourValues(): TourFormValues {
  return {
    slug: "",
    code: "",
    title: blank(),
    tagline: blank(),
    locationSlug: "",
    nights: "2",
    difficulty: "moderate",
    priceVnd: "",
    maxGuests: "12",
    featured: false,
    status: "draft",
    sortOrder: "0",
    highlights: [],
    includes: [],
    itinerary: [],
    image: { ...NO_IMAGE, alt: blank() },
  };
}

type TourLike = Omit<TourData, "image" | "featured"> & { image: ImageRef | null; featured?: boolean };

export function tourToFormValues(t: TourLike): TourFormValues {
  // "TBD" marks the bundled placeholder covers, which are not real licensed photos.
  const image = t.image && t.image.src && t.image.license !== "TBD" ? t.image : null;
  return {
    slug: t.slug,
    code: t.code,
    title: { ...t.title },
    tagline: { ...t.tagline },
    locationSlug: t.locationSlug,
    nights: String(t.nights),
    difficulty: t.difficulty,
    priceVnd: String(t.priceVnd),
    maxGuests: String(t.maxGuests),
    featured: Boolean(t.featured),
    status: t.status,
    sortOrder: String(t.sortOrder),
    highlights: t.highlights.map((h) => ({ ...h })),
    includes: t.includes.map((h) => ({ ...h })),
    itinerary: t.itinerary.map((s) => ({ title: { ...s.title }, body: { ...s.body } })),
    image: image ? { ...image, alt: { ...image.alt } } : { ...NO_IMAGE, alt: blank() },
  };
}

/** Maps form values onto the schema input: a blank image src means no image. */
export function formToInput(v: TourFormValues): unknown {
  return { ...v, image: v.image.src.trim() === "" ? null : v.image };
}

export type FieldErrors = Record<string, string>;

/** Flattens zod issues to "a.b.0.c" → message key, first issue per path wins. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

export function parseTour(v: unknown) {
  const r = tourInput.safeParse(v);
  return r.success ? ({ ok: true, data: r.data } as const) : ({ ok: false, errors: fieldErrors(r.error) } as const);
}

// ---- Change requests (work a developer has to ship in code) -------------------

const coord = (min: number, max: number) => z.preprocess(toNumber, num().min(min, "tooSmall").max(max, "tooLarge"));

export const changeRequestInput = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("location"),
    title: text(160, 3),
    details: z.string().trim().max(4000, "tooLong"),
    location: z.object({
      nameVi: text(120),
      nameEn: text(120),
      // Rough bounding box of Vietnam, islands included.
      lat: coord(8, 23.5),
      lng: coord(102, 117.5),
      notes: z.string().trim().max(2000, "tooLong"),
    }),
    tourSlug: z.string().max(80).optional(),
  }),
  z.object({
    kind: z.enum(["3d", "panorama", "other"]),
    title: text(160, 3),
    details: text(4000, 10),
    tourSlug: z.string().max(80).optional(),
  }),
]);

export type ChangeRequestData = z.output<typeof changeRequestInput>;

export type ChangeRequestFormValues = {
  kind: ChangeKind;
  title: string;
  details: string;
  location: { nameVi: string; nameEn: string; lat: string; lng: string; notes: string };
  tourSlug?: string;
};

export function emptyChangeRequest(tourSlug?: string): ChangeRequestFormValues {
  return { kind: "location", title: "", details: "", location: { nameVi: "", nameEn: "", lat: "", lng: "", notes: "" }, tourSlug };
}

export function changeRequestFormToInput(v: ChangeRequestFormValues): unknown {
  return v.kind === "location" ? v : { kind: v.kind, title: v.title, details: v.details, tourSlug: v.tourSlug };
}

export function parseChangeRequest(v: unknown) {
  const r = changeRequestInput.safeParse(v);
  return r.success ? ({ ok: true, data: r.data } as const) : ({ ok: false, errors: fieldErrors(r.error) } as const);
}
