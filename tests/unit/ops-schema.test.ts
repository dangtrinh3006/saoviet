import { describe, expect, it } from "vitest";
import {
  changeResolveInput,
  csvCell,
  csvRow,
  filtersToQuery,
  isoDate,
  likeEscape,
  orderEditInput,
  orderTotal,
  parseOrderFilters,
  serviceInput,
} from "@/lib/ops-schema";
import en from "../../messages/extra/adminops.en.json";
import vi from "../../messages/extra/adminops.vi.json";

const service = {
  slug: "night-photo-walk",
  icon: "camera" as const,
  title: { vi: "Dạo đêm chụp ảnh", en: "Night photo walk" },
  body: { vi: "Mô tả", en: "Description" },
  fromVnd: 500000,
  status: "draft" as const,
};

const order = {
  id: "o1",
  departureDate: "2026-12-24",
  guests: 3,
  contactName: "Nguyen Van A",
  contactEmail: "a@example.test",
  contactPhone: "+84 912 345 678",
};

describe("serviceInput", () => {
  it("accepts a complete bilingual service and coerces the price", () => {
    const r = serviceInput.safeParse({ ...service, fromVnd: "750000" });
    expect(r.success && r.data.fromVnd).toBe(750000);
  });

  it("rejects bad slugs, unknown icons, a missing language and negative prices", () => {
    for (const slug of ["Has Caps", "-lead", "trail-", "a", "double--dash", "dấu"]) {
      expect(serviceInput.safeParse({ ...service, slug }).success, slug).toBe(false);
    }
    expect(serviceInput.safeParse({ ...service, icon: "rocket" }).success).toBe(false);
    expect(serviceInput.safeParse({ ...service, title: { vi: "Có", en: "  " } }).success).toBe(false);
    expect(serviceInput.safeParse({ ...service, fromVnd: -1 }).success).toBe(false);
    expect(serviceInput.safeParse({ ...service, fromVnd: 1.5 }).success).toBe(false);
  });
});

describe("orderEditInput", () => {
  it("accepts an edit and defaults the optional notes to empty", () => {
    const r = orderEditInput.safeParse(order);
    expect(r.success).toBe(true);
    expect(r.success && r.data.note).toBe("");
    expect(r.success && r.data.activityNote).toBe("");
  });

  it("rejects impossible dates, zero or too many guests and malformed contacts", () => {
    expect(orderEditInput.safeParse({ ...order, departureDate: "2026-02-30" }).success).toBe(false);
    expect(orderEditInput.safeParse({ ...order, departureDate: "24/12/2026" }).success).toBe(false);
    expect(orderEditInput.safeParse({ ...order, guests: 0 }).success).toBe(false);
    expect(orderEditInput.safeParse({ ...order, guests: 51 }).success).toBe(false);
    expect(orderEditInput.safeParse({ ...order, contactEmail: "nope" }).success).toBe(false);
    expect(orderEditInput.safeParse({ ...order, contactPhone: "abc" }).success).toBe(false);
  });

  it("recomputes the total from the booked unit price", () => {
    expect(orderTotal(1_250_000, 3)).toBe(3_750_000);
  });
});

describe("isoDate", () => {
  it("validates real calendar days including leap years", () => {
    expect(isoDate.safeParse("2028-02-29").success).toBe(true);
    expect(isoDate.safeParse("2027-02-29").success).toBe(false);
    expect(isoDate.safeParse("2026-13-01").success).toBe(false);
  });
});

describe("changeResolveInput", () => {
  it("requires a note only when rejecting", () => {
    expect(changeResolveInput.safeParse({ id: "c1", status: "done" }).success).toBe(true);
    expect(changeResolveInput.safeParse({ id: "c1", status: "rejected" }).success).toBe(false);
    expect(changeResolveInput.safeParse({ id: "c1", status: "rejected", resolutionNote: "Duplicate" }).success).toBe(true);
    expect(changeResolveInput.safeParse({ id: "c1", status: "open" }).success).toBe(false);
  });
});

describe("order filters", () => {
  it("falls back to defaults on junk instead of throwing", () => {
    const f = parseOrderFilters({ status: "lost", sort: "random", page: "-3", from: "yesterday", q: ["SV-ABC", "x"] });
    expect(f).toMatchObject({ status: undefined, sort: "created_desc", page: 1, from: undefined, q: "SV-ABC" });
  });

  it("treats empty form fields as absent and keeps valid ones", () => {
    const f = parseOrderFilters({ q: "", status: "confirmed", tour: "", from: "2026-11-01", to: "2026-11-30", page: "2" });
    expect(f).toMatchObject({ q: undefined, status: "confirmed", tour: undefined, from: "2026-11-01", to: "2026-11-30", page: 2 });
  });

  it("round-trips through the query string without default noise", () => {
    const f = parseOrderFilters({ q: "a b", status: "pending", page: "3" });
    expect(filtersToQuery(f)).toBe("?q=a+b&status=pending&page=3");
    expect(filtersToQuery(f, { page: 1 })).toBe("?q=a+b&status=pending");
    expect(filtersToQuery(parseOrderFilters({}))).toBe("");
    expect(parseOrderFilters(Object.fromEntries(new URLSearchParams(filtersToQuery(f))))).toEqual(f);
  });

  it("escapes LIKE wildcards", () => {
    expect(likeEscape("50%_off\\")).toBe("50\\%\\_off\\\\");
  });
});

describe("csv", () => {
  it("quotes separators, quotes and newlines", () => {
    expect(csvCell('say "hi", ok')).toBe('"say ""hi"", ok"');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
    expect(csvCell(null)).toBe("");
    expect(csvRow(["a", 1, undefined])).toBe("a,1,");
  });

  it("neutralises spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("+84 912")).toBe("'+84 912");
    expect(csvCell("@cmd")).toBe("'@cmd");
  });

  it("writes dates as ISO strings", () => {
    expect(csvCell(new Date("2026-11-05T01:02:03Z"))).toBe("2026-11-05T01:02:03.000Z");
  });
});

describe("adminops messages", () => {
  const keys = (o: object, p = ""): string[] =>
    Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`]));
  it("vi and en define the same keys", () => {
    expect(keys(vi).sort()).toEqual(keys(en).sort());
  });
});
