import { describe, expect, it } from "vitest";
import { tours } from "@/content/tours";
import {
  changeRequestFormToInput,
  emptyChangeRequest,
  emptyTourValues,
  formToInput,
  isOptimizableImage,
  parseChangeRequest,
  parseTour,
  slugify,
  tourToFormValues,
  type TourFormValues,
} from "@/lib/catalog-schema";
import en from "../../messages/extra/admincatalog.en.json";
import vi from "../../messages/extra/admincatalog.vi.json";

const keys = (o: object, p = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`]));

function valid(): TourFormValues {
  return {
    ...emptyTourValues(),
    slug: "ta-xua-test",
    code: "SV-42",
    title: { vi: "Tà Xùa thử nghiệm", en: "Ta Xua test" },
    tagline: { vi: "Một đêm dưới Ngân Hà", en: "A night under the Milky Way" },
    locationSlug: "ta-xua",
    nights: "2",
    priceVnd: "4500000",
    maxGuests: "10",
    highlights: [{ vi: "Biển mây", en: "Cloud sea" }],
    itinerary: [{ title: { vi: "Ngày 1", en: "Day 1" }, body: { vi: "Lên núi", en: "Drive up" } }],
  };
}

describe("tourInput", () => {
  it("accepts a complete payload and coerces numeric strings", () => {
    const r = parseTour(formToInput(valid()));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.priceVnd).toBe(4_500_000);
      expect(r.data.nights).toBe(2);
      expect(r.data.image).toBeNull();
    }
  });

  it("round-trips every bundled tour through the form mapping", () => {
    for (const [i, t] of tours.entries()) {
      const r = parseTour(formToInput(tourToFormValues({ ...t, status: "published", sortOrder: i })));
      expect(r.ok ? true : r.errors, t.slug).toBe(true);
    }
  });

  it("rejects a blank price as required instead of coercing it to 0", () => {
    const r = parseTour(formToInput({ ...valid(), priceVnd: "" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.priceVnd).toBe("required");
  });

  it.each([
    ["slug", { slug: "Ta Xua!" }, "slug"],
    ["code", { code: "XX-1" }, "code"],
    ["locationSlug", { locationSlug: "atlantis" }, "location"],
    ["nights", { nights: "0" }, "tooSmall"],
    ["nights", { nights: "1.5" }, "integer"],
    ["maxGuests", { maxGuests: "abc" }, "number"],
    ["title.en", { title: { vi: "Tên", en: "  " } }, "required"],
  ] as const)("flags %s", (path, override, message) => {
    const r = parseTour(formToInput({ ...valid(), ...override } as TourFormValues));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[path]).toBe(message);
  });

  it("reports the index of a broken list item", () => {
    const r = parseTour(formToInput({ ...valid(), itinerary: [...valid().itinerary, { title: { vi: "", en: "x" }, body: { vi: "y", en: "y" } }] }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors["itinerary.1.title.vi"]).toBe("required");
  });

  it("accepts any https image or a site path, and rejects unsafe forms", () => {
    const img = (src: string) => ({ src, alt: { vi: "a", en: "a" }, credit: "ESO", license: "CC BY 4.0", sourceUrl: "https://eso.org/x" });
    const check = (src: string) => parseTour(formToInput({ ...valid(), image: img(src) })).ok;
    expect(check("https://upload.wikimedia.org/a.jpg")).toBe(true);
    expect(check("/img/tours/x.jpg")).toBe(true);
    expect(check("http://upload.wikimedia.org/a.jpg")).toBe(false);
    expect(check("https://cdn.example.com/a.jpg")).toBe(true);
    expect(check("//upload.wikimedia.org/a.jpg")).toBe(false);
    expect(check("javascript:alert(1)")).toBe(false);
    expect(check("/img/../../etc/passwd")).toBe(false);
  });

  it("only routes known hosts and site paths through the Next image optimiser", () => {
    expect(isOptimizableImage("/img/tours/x.jpg")).toBe(true);
    expect(isOptimizableImage("https://upload.wikimedia.org/a.jpg")).toBe(true);
    expect(isOptimizableImage("https://cdn.example.com/a.jpg")).toBe(false);
  });

  it("requires attribution once an image src is set", () => {
    const r = parseTour(formToInput({ ...valid(), image: { src: "https://upload.wikimedia.org/a.jpg", alt: { vi: "", en: "" }, credit: "", license: "", sourceUrl: "ftp://x" } }));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors["image.alt.vi"]).toBe("required");
      expect(r.errors["image.credit"]).toBe("required");
      expect(r.errors["image.sourceUrl"]).toBe("https");
    }
  });
});

describe("slugify", () => {
  it("strips Vietnamese tone marks and đ", () => {
    expect(slugify("Đà Lạt: Ngân Hà trên đồi thông")).toBe("da-lat-ngan-ha-tren-doi-thong");
    expect(slugify("  --Côn Đảo!!  ")).toBe("con-dao");
  });
});

describe("changeRequestInput", () => {
  it("accepts a location with coordinates inside Vietnam", () => {
    const v = { ...emptyChangeRequest(), title: "Núi Bà Đen", location: { nameVi: "Núi Bà Đen", nameEn: "Ba Den Mountain", lat: "11.38", lng: "106.17", notes: "" } };
    const r = parseChangeRequest(changeRequestFormToInput(v));
    expect(r.ok).toBe(true);
    if (r.ok && r.data.kind === "location") expect(r.data.location.lat).toBeCloseTo(11.38);
  });

  it("rejects coordinates outside Vietnam and missing names", () => {
    const v = { ...emptyChangeRequest(), title: "Paris", location: { nameVi: "", nameEn: "Paris", lat: "48.85", lng: "2.35", notes: "" } };
    const r = parseChangeRequest(changeRequestFormToInput(v));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors["location.lat"]).toBe("tooLarge");
      expect(r.errors["location.lng"]).toBe("tooSmall");
      expect(r.errors["location.nameVi"]).toBe("required");
    }
  });

  it("requires details for 3D, panorama and other requests", () => {
    for (const kind of ["3d", "panorama", "other"] as const) {
      const r = parseChangeRequest(changeRequestFormToInput({ ...emptyChangeRequest(), kind, title: "Cảnh 3D Tà Xùa", details: "" }));
      expect(r.ok, kind).toBe(false);
      if (!r.ok) expect(r.errors.details).toBe("required");
    }
    expect(parseChangeRequest({ kind: "content", title: "abc", details: "long enough text" }).ok).toBe(false);
  });
});

describe("admincatalog messages", () => {
  it("vi and en have identical keys", () => {
    expect(keys(vi).sort()).toEqual(keys(en).sort());
  });
});
