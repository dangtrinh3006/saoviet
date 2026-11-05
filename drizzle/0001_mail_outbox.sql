CREATE TYPE "public"."mail_status" AS ENUM('queued', 'sent', 'failed');--> statement-breakpoint
CREATE TABLE "mail_outbox" (
	"id" text PRIMARY KEY NOT NULL,
	"to" text NOT NULL,
	"subject" text NOT NULL,
	"html" text NOT NULL,
	"text" text NOT NULL,
	"kind" text NOT NULL,
	"status" "mail_status" DEFAULT 'queued' NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "mail_outbox_created_idx" ON "mail_outbox" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "mail_outbox_to_idx" ON "mail_outbox" USING btree ("to");