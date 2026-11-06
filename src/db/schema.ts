import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { ImageRef, L10n } from "@/content/types";

// Auth tables follow the Better Auth core schema + admin plugin columns (role, banned...).
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  impersonatedBy: text("impersonated_by"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

// Tours live in src/content (editorial data); orders reference them by slug and
// snapshot the price so a later catalogue edit never rewrites a past order.
export const order = pgTable(
  "order",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    tourSlug: text("tour_slug").notNull(),
    departureDate: text("departure_date").notNull(),
    guests: integer("guests").notNull(),
    unitPriceVnd: integer("unit_price_vnd").notNull(),
    totalVnd: integer("total_vnd").notNull(),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone").notNull(),
    note: text("note"),
    status: orderStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("order_user_idx").on(t.userId), index("order_status_idx").on(t.status)],
);

// One review per user per tour; rating 1..5 enforced in the server action.
export const review = pgTable(
  "review",
  {
    id: text("id").primaryKey(),
    tourSlug: text("tour_slug").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("review_user_tour_uq").on(t.userId, t.tourSlug)],
);

// Comments attach to any content by (target_type, target_id): blog post, forum thread.
export const comment = pgTable(
  "comment",
  {
    id: text("id").primaryKey(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("comment_target_idx").on(t.targetType, t.targetId)],
);

export const thread = pgTable(
  "thread",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    category: text("category").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    pinned: boolean("pinned").notNull().default(false),
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("thread_category_idx").on(t.category)],
);

export const userRelations = relations(user, ({ many }) => ({
  orders: many(order),
  reviews: many(review),
  comments: many(comment),
  threads: many(thread),
}));

export const orderRelations = relations(order, ({ one }) => ({
  user: one(user, { fields: [order.userId], references: [user.id] }),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  user: one(user, { fields: [review.userId], references: [user.id] }),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  user: one(user, { fields: [comment.userId], references: [user.id] }),
}));

export const threadRelations = relations(thread, ({ one }) => ({
  user: one(user, { fields: [thread.userId], references: [user.id] }),
}));

export const mailStatus = pgEnum("mail_status", ["queued", "sent", "failed"]);

// Every outgoing mail is kept here, delivered or not, so admins can read or forward it.
export const mailOutbox = pgTable(
  "mail_outbox",
  {
    id: text("id").primaryKey(),
    to: text("to").notNull(),
    subject: text("subject").notNull(),
    html: text("html").notNull(),
    text: text("text").notNull(),
    kind: text("kind").notNull(),
    status: mailStatus("status").notNull().default("queued"),
    error: text("error"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("mail_outbox_created_idx").on(t.createdAt), index("mail_outbox_to_idx").on(t.to)],
);

// ---- Catalogue (admin-editable) -----------------------------------------------
// Bilingual fields are stored as {vi, en} JSON so a row maps 1:1 onto the content types.

export const publishStatus = pgEnum("publish_status", ["draft", "published", "archived"]);

export const tour = pgTable(
  "tour",
  {
    slug: text("slug").primaryKey(),
    code: text("code").notNull(),
    title: jsonb("title").$type<L10n>().notNull(),
    tagline: jsonb("tagline").$type<L10n>().notNull(),
    locationSlug: text("location_slug").notNull(),
    nights: integer("nights").notNull(),
    difficulty: text("difficulty").$type<"easy" | "moderate" | "hard">().notNull(),
    priceVnd: integer("price_vnd").notNull(),
    maxGuests: integer("max_guests").notNull(),
    highlights: jsonb("highlights").$type<L10n[]>().notNull().default([]),
    itinerary: jsonb("itinerary").$type<{ title: L10n; body: L10n }[]>().notNull().default([]),
    includes: jsonb("includes").$type<L10n[]>().notNull().default([]),
    image: jsonb("image").$type<ImageRef | null>(),
    featured: boolean("featured").notNull().default(false),
    status: publishStatus("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("tour_status_idx").on(t.status)],
);

export const service = pgTable("service", {
  slug: text("slug").primaryKey(),
  icon: text("icon").$type<"telescope" | "camera" | "tent" | "users" | "graduation" | "moon">().notNull(),
  title: jsonb("title").$type<L10n>().notNull(),
  body: jsonb("body").$type<L10n>().notNull(),
  fromVnd: integer("from_vnd").notNull(),
  status: publishStatus("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Work an admin cannot finish online (new 3D site, coordinates/SQM, 360° imagery) is
// queued here for developers to ship in code, then marked done.
export const changeStatus = pgEnum("change_status", ["open", "in_progress", "done", "rejected"]);

export const changeRequest = pgTable(
  "change_request",
  {
    id: text("id").primaryKey(),
    kind: text("kind").$type<"location" | "panorama" | "3d" | "content" | "other">().notNull(),
    title: text("title").notNull(),
    details: text("details").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    status: changeStatus("status").notNull().default("open"),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    resolutionNote: text("resolution_note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at"),
  },
  (t) => [index("change_request_status_idx").on(t.status)],
);

// ---- Admin audit trail ---------------------------------------------------------
// Actor email is copied so the trail stays readable after the account is deleted.
export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id"),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("audit_log_created_idx").on(t.createdAt), index("audit_log_target_idx").on(t.targetType, t.targetId)],
);
