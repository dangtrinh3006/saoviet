CREATE TYPE "public"."change_status" AS ENUM('open', 'in_progress', 'done', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."publish_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "change_request" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"details" text NOT NULL,
	"payload" jsonb,
	"status" "change_status" DEFAULT 'open' NOT NULL,
	"created_by" text,
	"resolution_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "service" (
	"slug" text PRIMARY KEY NOT NULL,
	"icon" text NOT NULL,
	"title" jsonb NOT NULL,
	"body" jsonb NOT NULL,
	"from_vnd" integer NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour" (
	"slug" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" jsonb NOT NULL,
	"tagline" jsonb NOT NULL,
	"location_slug" text NOT NULL,
	"nights" integer NOT NULL,
	"difficulty" text NOT NULL,
	"price_vnd" integer NOT NULL,
	"max_guests" integer NOT NULL,
	"highlights" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"itinerary" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"includes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image" jsonb,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "change_request" ADD CONSTRAINT "change_request_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "change_request_status_idx" ON "change_request" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tour_status_idx" ON "tour" USING btree ("status");