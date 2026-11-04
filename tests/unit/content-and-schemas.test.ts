import { describe, expect, it } from "vitest";
import { locations } from "@/content/locations";
import { posts } from "@/content/posts";
import { tours } from "@/content/tours";
import { formatCoord, formatVnd, pick } from "@/lib/l10n";
import { bortleFromSqm } from "@/lib/sky";
import { orderInput, threadInput } from "@/server/schemas";
import en from "../../messages/en.json";
import vi from "../../messages/vi.json";

const keys = (o: object, p = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`]));

describe("content integrity", () => {
  it("every tour points at a real location and has a licensed image", () => {
    for (const t of tours) {
      expect(locations.some((l) => l.slug === t.locationSlug), t.slug).toBe(true);
      expect(t.image.license, t.slug).not.toBe("TBD");
    }
  });
  it("location Bortle agrees with its estimated SQM within one class", () => {
    for (const l of locations) expect(Math.abs(bortleFromSqm(l.sqm) - l.bortle), l.slug).toBeLessThanOrEqual(1);
  });
  it("coordinates fall inside Vietnam's bounding box", () => {
    for (const l of locations) {
      expect(l.lat).toBeGreaterThan(8);
      expect(l.lat).toBeLessThan(23.5);
      expect(l.lng).toBeGreaterThan(102);
      expect(l.lng).toBeLessThan(110);
    }
  });
  it("slugs are unique", () => {
    for (const list of [locations, tours, posts]) expect(new Set(list.map((x) => x.slug)).size).toBe(list.length);
  });
  it("vi and en message files have identical keys", () => {
    expect(keys(vi).sort()).toEqual(keys(en).sort());
  });
});

describe("l10n helpers", () => {
  it("picks the requested locale", () => expect(pick({ vi: "Sao", en: "Star" }, "en")).toBe("Star"));
  it("formats VND without decimals", () => expect(formatVnd(3900000, "vi")).toMatch(/3\.900\.000/));
  it("formats coordinates as DMS", () => expect(formatCoord(21.33, 104.48)).toBe("21°20′N 104°29′E"));
});

describe("order schema", () => {
  const valid = {
    tourSlug: "ta-xua-cloud-sea-milky-way",
    departureDate: "2030-01-10",
    guests: 2,
    contactName: "Nguyễn Văn A",
    contactEmail: "a@example.com",
    contactPhone: "+84 912 345 678",
  };
  it("accepts a valid booking", () => expect(orderInput.safeParse(valid).success).toBe(true));
  it.each([
    ["guests", 0],
    ["guests", 21],
    ["contactEmail", "not-an-email"],
    ["contactPhone", "abc"],
    ["departureDate", "10/01/2030"],
  ])("rejects bad %s", (field, value) => expect(orderInput.safeParse({ ...valid, [field]: value }).success).toBe(false));
  it("rejects an unknown forum category", () =>
    expect(threadInput.safeParse({ title: "Hello world", body: "Long enough body", category: "spam" }).success).toBe(false));
});
