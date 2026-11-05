"use server";

import type { z } from "zod";
import { contactInput, type ContactInput } from "@/lib/contact-schema";

export type ContactResult = { ok: true } | { ok: false; error: "INVALID_INPUT" };

// Delivery point for the mail outbox once that service exists; until then nothing is
// stored or logged, so a contact message never leaves personal data on the server.
async function deliver(message: z.output<typeof contactInput>) {
  void message;
}

export async function sendContactMessage(input: ContactInput): Promise<ContactResult> {
  const parsed = contactInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  // A filled honeypot gets the same answer as a person, so bots learn nothing.
  if (!parsed.data.website) await deliver(parsed.data);
  return { ok: true };
}
