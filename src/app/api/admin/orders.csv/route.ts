import { getFreshSession } from "@/lib/auth";
import { csvRow, parseOrderFilters } from "@/lib/ops-schema";
import { tourLookup } from "@/server/catalog";
import { exportOrders, todayVn } from "@/server/ops-queries";

const HEADER = [
  "code",
  "tour_slug",
  "tour_title",
  "departure_date",
  "guests",
  "unit_price_vnd",
  "total_vnd",
  "status",
  "contact_name",
  "contact_email",
  "contact_phone",
  "note",
  "created_at",
];

export async function GET(request: Request) {
  const session = await getFreshSession();
  // Same 404 as the admin pages, so the endpoint does not advertise itself.
  if (session?.user.role !== "admin") return new Response("Not found", { status: 404 });

  const filters = parseOrderFilters(Object.fromEntries(new URL(request.url).searchParams));
  const [rows, catalog] = await Promise.all([exportOrders(filters), tourLookup()]);
  const lines = [
    csvRow(HEADER),
    ...rows.map((o) =>
      csvRow([
        o.code,
        o.tourSlug,
        catalog.get(o.tourSlug)?.title.vi ?? "",
        o.departureDate,
        o.guests,
        o.unitPriceVnd,
        o.totalVnd,
        o.status,
        o.contactName,
        o.contactEmail,
        o.contactPhone,
        o.note,
        o.createdAt,
      ]),
    ),
  ];
  // BOM so Excel opens UTF-8 Vietnamese text correctly.
  return new Response(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${todayVn()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
