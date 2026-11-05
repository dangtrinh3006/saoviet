import { z } from "zod";

export const SERVICE_ICONS = ["telescope", "camera", "tent", "users", "graduation", "moon"] as const;
export const PUBLISH_STATUSES = ["draft", "published", "archived"] as const;
export const ORDER_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export const CHANGE_STATUSES = ["open", "in_progress", "done", "rejected"] as const;
export const CHANGE_KINDS = ["location", "panorama", "3d", "content", "other"] as const;
export const ORDER_SORTS = ["created_desc", "created_asc", "departure_asc", "departure_desc", "total_desc", "total_asc"] as const;
export const PAGE_SIZE = 25;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderSort = (typeof ORDER_SORTS)[number];

const l10n = (max: number) =>
  z.object({ vi: z.string().trim().min(1).max(max), en: z.string().trim().min(1).max(max) });

/** Calendar-valid YYYY-MM-DD (rejects 2026-02-30). */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, "INVALID_DATE");

export const serviceInput = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  icon: z.enum(SERVICE_ICONS),
  title: l10n(120),
  body: l10n(2000),
  fromVnd: z.coerce.number().int().min(0).max(1_000_000_000),
  status: z.enum(PUBLISH_STATUSES),
});
export type ServiceInput = z.infer<typeof serviceInput>;

export const orderEditInput = z.object({
  id: z.string().min(1).max(200),
  departureDate: isoDate,
  guests: z.coerce.number().int().min(1).max(50),
  contactName: z.string().trim().min(2).max(80),
  contactEmail: z.string().trim().email().max(120),
  contactPhone: z.string().trim().regex(/^[+0-9 ()-]{8,20}$/),
  note: z.string().trim().max(4000).optional().default(""),
  activityNote: z.string().trim().max(500).optional().default(""),
});
export type OrderEditInput = z.input<typeof orderEditInput>;

export const changeResolveInput = z
  .object({
    id: z.string().min(1).max(200),
    status: z.enum(["in_progress", "done", "rejected"]),
    resolutionNote: z.string().trim().max(2000).optional().default(""),
  })
  // A rejection without a reason leaves the requester guessing.
  .refine((v) => v.status !== "rejected" || v.resolutionNote.length > 0, { path: ["resolutionNote"], message: "REQUIRED" });

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values).optional().catch(undefined);

/** Order list filters from searchParams; bad values fall back to defaults instead of erroring. */
export const orderFilters = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  status: optionalEnum(ORDER_STATUSES),
  tour: z.string().trim().max(120).optional().catch(undefined),
  from: isoDate.optional().catch(undefined),
  to: isoDate.optional().catch(undefined),
  sort: z.enum(ORDER_SORTS).catch("created_desc").default("created_desc"),
  page: z.coerce.number().int().min(1).max(10_000).catch(1).default(1),
});
export type OrderFilters = z.infer<typeof orderFilters>;

export function parseOrderFilters(raw: Record<string, string | string[] | undefined>): OrderFilters {
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, (Array.isArray(v) ? v[0] : v) || undefined]),
  );
  return orderFilters.parse(flat);
}

/** Query string for the given filters, dropping defaults so URLs stay short. */
export function filtersToQuery(f: Partial<OrderFilters>, overrides: Partial<OrderFilters> = {}) {
  const merged = { ...f, ...overrides };
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === undefined || v === "") continue;
    if (k === "sort" && v === "created_desc") continue;
    if (k === "page" && v === 1) continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const orderTotal = (unitPriceVnd: number, guests: number) => unitPriceVnd * guests;

/** Escape for LIKE patterns so user input such as "50%" matches literally. */
export const likeEscape = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/** RFC 4180 cell; leading = + - @ are prefixed so spreadsheets do not run them as formulas. */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const csvRow = (cells: unknown[]) => cells.map(csvCell).join(",");
