"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { getTour, getTourAnyStatus } from "@/server/catalog";
import { db, schema } from "@/db";
import { getSession, requireAdmin, requireUser } from "@/lib/auth";
import { formatVnd } from "@/lib/l10n";
import { bookingConfirmationMail } from "@/lib/mail-templates";
import { sendMail } from "@/lib/mailer";
import { commentInput, orderInput, reviewInput, threadInput } from "./schemas";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const id = () => crypto.randomUUID();
const fail = (error: string): ActionResult<never> => ({ ok: false, error });

function orderCode() {
  // Human-readable, unambiguous alphabet (no 0/O/1/I).
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `SV-${Array.from(bytes, (b) => abc[b % abc.length]).join("")}`;
}


export async function createOrder(input: z.input<typeof orderInput>): Promise<ActionResult<{ code: string }>> {
  const parsed = orderInput.safeParse(input);
  if (!parsed.success) return fail("INVALID_INPUT");
  const v = parsed.data;
  const tour = await getTour(v.tourSlug);
  if (!tour) return fail("UNKNOWN_TOUR");
  if (v.guests > tour.maxGuests) return fail("TOO_MANY_GUESTS");
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  if (v.departureDate <= today) return fail("DATE_IN_PAST");

  // Price comes from the catalogue on the server, never from the client.
  const session = await getSession();
  const code = orderCode();
  await db.insert(schema.order).values({
    id: id(),
    code,
    userId: session?.user.id ?? null,
    tourSlug: tour.slug,
    departureDate: v.departureDate,
    guests: v.guests,
    unitPriceVnd: tour.priceVnd,
    totalVnd: tour.priceVnd * v.guests,
    contactName: v.contactName,
    contactEmail: v.contactEmail,
    contactPhone: v.contactPhone,
    note: v.note || null,
  });
  // The order is already stored; a mail outage must never turn it into a failure.
  try {
    const total = tour.priceVnd * v.guests;
    await sendMail({
      to: v.contactEmail,
      kind: "booking-confirmation",
      ...bookingConfirmationMail({
        name: v.contactName,
        code,
        tourTitle: { vi: tour.title.vi, en: tour.title.en },
        departureDate: v.departureDate,
        guests: v.guests,
        total: { vi: formatVnd(total, "vi"), en: formatVnd(total, "en") },
      }),
    });
  } catch (e) {
    console.error("booking confirmation mail failed", code, e instanceof Error ? e.message : e);
  }
  revalidatePath("/[locale]/account", "page");
  revalidatePath("/[locale]/admin", "page");
  return { ok: true, data: { code } };
}


export async function upsertReview(input: z.input<typeof reviewInput>): Promise<ActionResult> {
  const session = await requireUser().catch(() => null);
  if (!session) return fail("UNAUTHENTICATED");
  const parsed = reviewInput.safeParse(input);
  if (!parsed.success || !(await getTourAnyStatus(parsed.data.tourSlug))) return fail("INVALID_INPUT");
  const v = parsed.data;
  await db
    .insert(schema.review)
    .values({ id: id(), tourSlug: v.tourSlug, userId: session.user.id, rating: v.rating, body: v.body })
    .onConflictDoUpdate({
      target: [schema.review.userId, schema.review.tourSlug],
      set: { rating: v.rating, body: v.body, createdAt: new Date() },
    });
  revalidatePath(`/[locale]/tours/${v.tourSlug}`, "page");
  return { ok: true };
}


export async function addComment(input: z.input<typeof commentInput>): Promise<ActionResult> {
  const session = await requireUser().catch(() => null);
  if (!session) return fail("UNAUTHENTICATED");
  const parsed = commentInput.safeParse(input);
  if (!parsed.success) return fail("INVALID_INPUT");
  await db.insert(schema.comment).values({ id: id(), userId: session.user.id, ...parsed.data });
  revalidatePath(parsed.data.targetType === "post" ? `/[locale]/blog/${parsed.data.targetId}` : `/[locale]/forum/${parsed.data.targetId}`, "page");
  return { ok: true };
}


function slugify(s: string) {
  const base = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base || "thread"}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createThread(input: z.input<typeof threadInput>): Promise<ActionResult<{ slug: string }>> {
  const session = await requireUser().catch(() => null);
  if (!session) return fail("UNAUTHENTICATED");
  const parsed = threadInput.safeParse(input);
  if (!parsed.success) return fail("INVALID_INPUT");
  const slug = slugify(parsed.data.title);
  await db.insert(schema.thread).values({ id: id(), slug, userId: session.user.id, ...parsed.data });
  revalidatePath("/[locale]/forum", "page");
  return { ok: true, data: { slug } };
}

// ---- Admin ----------------------------------------------------------------

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

export async function setOrderStatus(orderId: string, status: (typeof STATUSES)[number]): Promise<ActionResult> {
  await requireAdmin();
  if (!STATUSES.includes(status)) return fail("INVALID_INPUT");
  await db.update(schema.order).set({ status, updatedAt: new Date() }).where(eq(schema.order.id, orderId));
  revalidatePath("/[locale]/admin", "page");
  return { ok: true };
}

const MODERATABLE = { review: schema.review, comment: schema.comment, thread: schema.thread } as const;

export async function setHidden(kind: keyof typeof MODERATABLE, targetId: string, hidden: boolean): Promise<ActionResult> {
  await requireAdmin();
  const table = MODERATABLE[kind];
  if (!table) return fail("INVALID_INPUT");
  await db.update(table).set({ hidden }).where(eq(table.id, targetId));
  revalidatePath("/[locale]", "layout");
  return { ok: true };
}

/** Cancel own pending order. */
export async function cancelMyOrder(orderId: string): Promise<ActionResult> {
  const session = await requireUser().catch(() => null);
  if (!session) return fail("UNAUTHENTICATED");
  await db
    .update(schema.order)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(schema.order.id, orderId), eq(schema.order.userId, session.user.id), eq(schema.order.status, "pending")));
  revalidatePath("/[locale]/account", "page");
  return { ok: true };
}
