"use server";

import { asc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { services as staticServices } from "@/content/services";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { orderStatusMail, type NotifiedStatus } from "@/lib/mail-templates";
import { sendMail } from "@/lib/mailer";
import {
  changeResolveInput,
  ORDER_STATUSES,
  orderEditInput,
  orderTotal,
  serviceInput,
  type OrderEditInput,
  type OrderStatus,
  type ServiceInput,
} from "@/lib/ops-schema";
import { audit } from "./audit";
import { getTourAnyStatus } from "./catalog";

export type OpsResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const fail = (error: string): OpsResult<never> => ({ ok: false, error });
const idSchema = (v: unknown) => (typeof v === "string" && v.length > 0 && v.length <= 200 ? v : null);

function revalidatePublic() {
  revalidatePath("/[locale]", "layout");
  revalidatePath("/[locale]/services", "page");
}

// ---- Services --------------------------------------------------------------

/**
 * Public pages fall back to bundled services while the table is empty; copy them in
 * before the first admin insert so they do not vanish from /services.
 */
async function ensureServicesSeeded() {
  const [any] = await db.select({ slug: schema.service.slug }).from(schema.service).limit(1);
  if (any) return;
  await db
    .insert(schema.service)
    .values(staticServices.map((s, i) => ({ ...s, status: "published" as const, sortOrder: i })))
    .onConflictDoNothing();
}

export async function createService(input: ServiceInput): Promise<OpsResult<{ slug: string }>> {
  await requireAdmin();
  const parsed = serviceInput.safeParse(input);
  if (!parsed.success) return fail("INVALID_INPUT");
  await ensureServicesSeeded();
  const v = parsed.data;
  const [{ top }] = await db.select({ top: max(schema.service.sortOrder) }).from(schema.service);
  const inserted = await db
    .insert(schema.service)
    .values({ ...v, sortOrder: (top ?? -1) + 1 })
    .onConflictDoNothing()
    .returning({ slug: schema.service.slug });
  if (inserted.length === 0) return fail("SLUG_TAKEN");
  revalidatePublic();
  revalidatePath("/[locale]/admin", "layout");
  return { ok: true, data: { slug: v.slug } };
}

export async function updateService(slug: string, input: ServiceInput): Promise<OpsResult> {
  await requireAdmin();
  const parsed = serviceInput.safeParse({ ...input, slug });
  if (!parsed.success) return fail("INVALID_INPUT");
  const v = parsed.data;
  const updated = await db
    .update(schema.service)
    .set({ icon: v.icon, title: v.title, body: v.body, fromVnd: v.fromVnd, status: v.status, updatedAt: new Date() })
    .where(eq(schema.service.slug, slug))
    .returning({ slug: schema.service.slug });
  if (updated.length === 0) return fail("NOT_FOUND");
  revalidatePublic();
  revalidatePath("/[locale]/admin", "layout");
  return { ok: true };
}

/** Swaps with the neighbour; sortOrder is renumbered 0..n first so duplicates cannot stall a move. */
export async function moveService(slug: string, direction: "up" | "down"): Promise<OpsResult> {
  await requireAdmin();
  if (direction !== "up" && direction !== "down") return fail("INVALID_INPUT");
  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ slug: schema.service.slug })
      .from(schema.service)
      .orderBy(asc(schema.service.sortOrder), asc(schema.service.slug));
    const order = rows.map((r) => r.slug);
    const i = order.indexOf(slug);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    for (const [idx, s] of order.entries()) {
      await tx.update(schema.service).set({ sortOrder: idx }).where(eq(schema.service.slug, s));
    }
  });
  revalidatePublic();
  revalidatePath("/[locale]/admin", "layout");
  return { ok: true };
}

// ---- Orders ----------------------------------------------------------------

const isNotifiedStatus = (s: OrderStatus): s is NotifiedStatus => s === "confirmed" || s === "completed" || s === "cancelled";

/** Mail failures are logged in the outbox; they never undo the status change. */
async function notifyStatus(o: typeof schema.order.$inferSelect, status: NotifiedStatus) {
  try {
    const tour = await getTourAnyStatus(o.tourSlug);
    await sendMail({
      to: o.contactEmail,
      kind: "order-status",
      ...orderStatusMail({
        name: o.contactName,
        code: o.code,
        status,
        tourTitle: tour ? { vi: tour.title.vi, en: tour.title.en } : { vi: o.tourSlug, en: o.tourSlug },
        departureDate: o.departureDate,
      }),
    });
  } catch (e) {
    console.error("order status mail failed", o.code, e instanceof Error ? e.message : e);
  }
}

export async function setOrderStatusOps(orderId: string, status: OrderStatus): Promise<OpsResult> {
  const admin = await requireAdmin();
  const id = idSchema(orderId);
  if (!id || !ORDER_STATUSES.includes(status)) return fail("INVALID_INPUT");
  const [before] = await db.select().from(schema.order).where(eq(schema.order.id, id)).limit(1);
  if (!before) return fail("NOT_FOUND");
  await db.update(schema.order).set({ status, updatedAt: new Date() }).where(eq(schema.order.id, id));
  await audit(admin, "order.status", { type: "order", id }, { from: before.status, to: status });
  // Only a real change notifies the customer, so a repeated click never sends twice.
  if (before.status !== status && isNotifiedStatus(status)) await notifyStatus(before, status);
  revalidatePath("/[locale]/admin", "layout");
  revalidatePath("/[locale]/account", "page");
  return { ok: true };
}

/** Admin edits are appended to the order note as a signed log line and recorded in the audit log. */
export async function updateOrder(input: OrderEditInput): Promise<OpsResult<{ totalVnd: number; note: string }>> {
  const session = await requireAdmin();
  const parsed = orderEditInput.safeParse(input);
  if (!parsed.success) return fail("INVALID_INPUT");
  const v = parsed.data;
  const [current] = await db.select().from(schema.order).where(eq(schema.order.id, v.id)).limit(1);
  if (!current) return fail("NOT_FOUND");

  const changes: string[] = [];
  const track = (field: string, before: unknown, after: unknown) => {
    if (String(before ?? "") !== String(after ?? "")) changes.push(`${field}: ${before ?? "∅"} → ${after}`);
  };
  track("departureDate", current.departureDate, v.departureDate);
  track("guests", current.guests, v.guests);
  track("contactName", current.contactName, v.contactName);
  track("contactEmail", current.contactEmail, v.contactEmail);
  track("contactPhone", current.contactPhone, v.contactPhone);

  // Price per guest is the snapshot taken at booking time, never the current catalogue price.
  const totalVnd = orderTotal(current.unitPriceVnd, v.guests);
  let note = v.note;
  if (changes.length > 0 || v.activityNote) {
    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const line = `[${stamp} UTC · ${session.user.email}] ${[v.activityNote, changes.join("; ")].filter(Boolean).join(" — ")}`;
    note = note ? `${note}\n${line}` : line;
  }

  await db
    .update(schema.order)
    .set({
      departureDate: v.departureDate,
      guests: v.guests,
      totalVnd,
      contactName: v.contactName,
      contactEmail: v.contactEmail,
      contactPhone: v.contactPhone,
      note: note || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.order.id, v.id));
  if (changes.length > 0) await audit(session, "order.update", { type: "order", id: v.id }, { changes });
  revalidatePath("/[locale]/admin", "layout");
  revalidatePath("/[locale]/account", "page");
  return { ok: true, data: { totalVnd, note } };
}

export async function deleteOrder(orderId: string): Promise<OpsResult> {
  const admin = await requireAdmin();
  const id = idSchema(orderId);
  if (!id) return fail("INVALID_INPUT");
  const deleted = await db.delete(schema.order).where(eq(schema.order.id, id)).returning({ id: schema.order.id });
  if (deleted.length === 0) return fail("NOT_FOUND");
  await audit(admin, "order.delete", { type: "order", id });
  revalidatePath("/[locale]/admin", "layout");
  revalidatePath("/[locale]/account", "page");
  return { ok: true };
}

// ---- Change requests -------------------------------------------------------

export async function resolveChangeRequest(input: { id: string; status: "in_progress" | "done" | "rejected"; resolutionNote?: string }): Promise<OpsResult> {
  await requireAdmin();
  const parsed = changeResolveInput.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues.some((i) => i.path[0] === "resolutionNote") ? "NOTE_REQUIRED" : "INVALID_INPUT");
  const v = parsed.data;
  const final = v.status === "done" || v.status === "rejected";
  const updated = await db
    .update(schema.changeRequest)
    .set({ status: v.status, resolvedAt: final ? new Date() : null, ...(v.resolutionNote ? { resolutionNote: v.resolutionNote } : {}) })
    .where(eq(schema.changeRequest.id, v.id))
    .returning({ id: schema.changeRequest.id });
  if (updated.length === 0) return fail("NOT_FOUND");
  revalidatePath("/[locale]/admin", "layout");
  return { ok: true };
}
