import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

export type MailKind = "reset-password" | "booking-confirmation" | "order-status";
export type MailInput = { to: string; subject: string; html: string; text: string; kind: MailKind };
export type MailResult = { id: string; status: "queued" | "sent" | "failed" };

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Sao Việt <onboarding@resend.dev>";

/**
 * Persists the mail to mail_outbox first, then delivers via Resend when RESEND_API_KEY is set.
 * Delivery errors are recorded, not thrown: callers such as password reset must not leak them.
 */
export async function sendMail(input: MailInput): Promise<MailResult> {
  const id = crypto.randomUUID();
  await db.insert(schema.mailOutbox).values({ id, ...input, status: "queued" });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { id, status: "queued" };

  let error: string | null = null;
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? DEFAULT_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) error = `HTTP ${res.status}: ${(await res.text().catch(() => "")).slice(0, 500)}`;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const status = error ? "failed" : "sent";
  await db.update(schema.mailOutbox).set({ status, error }).where(eq(schema.mailOutbox.id, id));
  return { id, status };
}
