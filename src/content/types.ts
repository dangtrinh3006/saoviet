export type L10n = { vi: string; en: string };

export type Region = "north" | "central" | "highlands" | "south" | "islands";

export interface SkyLocation {
  slug: string;
  name: L10n;
  province: L10n;
  region: Region;
  lat: number;
  lng: number;
  elevationM: number;
  /** Estimated zenith sky brightness, mag/arcsec² — not a measurement (see `estimate`). */
  sqm: number;
  bortle: number;
  estimate: true;
  bestMonths: number[];
  summary: L10n;
  image?: ImageRef;
  panorama?: ImageRef;
}

export interface ImageRef {
  src: string;
  alt: L10n;
  credit: string;
  license: string;
  sourceUrl: string;
}

export interface Tour {
  slug: string;
  code: string;
  title: L10n;
  tagline: L10n;
  locationSlug: string;
  nights: number;
  difficulty: "easy" | "moderate" | "hard";
  priceVnd: number;
  maxGuests: number;
  highlights: L10n[];
  itinerary: { title: L10n; body: L10n }[];
  includes: L10n[];
  image: ImageRef;
  featured?: boolean;
}

export interface Post {
  slug: string;
  title: L10n;
  excerpt: L10n;
  category: "guide" | "story" | "science" | "gear";
  date: string;
  readingMinutes: number;
  cover: ImageRef;
  /** Markdown-lite: paragraphs separated by blank lines; lines starting with "## " are headings. */
  body: L10n;
}

export interface Service {
  slug: string;
  icon: "telescope" | "camera" | "tent" | "users" | "graduation" | "moon";
  title: L10n;
  body: L10n;
  fromVnd: number;
}
