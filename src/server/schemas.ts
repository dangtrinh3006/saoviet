import { z } from "zod";

export const TARGETS = ["post", "thread"] as const;
export const CATEGORIES = ["general", "gear", "trips", "photos"] as const;

export const orderInput = z.object({
  tourSlug: z.string().min(1),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(1).max(20),
  contactName: z.string().trim().min(2).max(80),
  contactEmail: z.string().trim().email().max(120),
  contactPhone: z.string().trim().regex(/^[+0-9 ()-]{8,20}$/),
  note: z.string().trim().max(1000).optional(),
});

export const reviewInput = z.object({
  tourSlug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(2000),
});

export const commentInput = z.object({
  targetType: z.enum(TARGETS),
  targetId: z.string().min(1).max(120),
  body: z.string().trim().min(2).max(2000),
});

export const threadInput = z.object({
  title: z.string().trim().min(6).max(140),
  body: z.string().trim().min(10).max(5000),
  category: z.enum(CATEGORIES),
});
