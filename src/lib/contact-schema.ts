import { z } from "zod";

export const CONTACT_TOPICS = ["booking", "tour", "partnership", "privacy", "community", "other"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 3000;

// Shared by the client form and the server action so both reject the same input.
export const contactInput = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  topic: z.enum(CONTACT_TOPICS),
  message: z.string().trim().min(MESSAGE_MIN).max(MESSAGE_MAX),
  /** Honeypot: hidden from people, filled by naive bots. */
  website: z.string().max(200).optional(),
});

export type ContactInput = z.input<typeof contactInput>;
