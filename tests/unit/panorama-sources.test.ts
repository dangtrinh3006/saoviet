import { describe, expect, it } from "vitest";
import {
  bboxAround,
  commonsGeosearchUrl,
  commonsPano360SearchUrl,
  commonsPanoramas,
  haversineKm,
  isEquirectangular,
  mapillaryQueryUrl,
  nearestMapillary,
  pickNearest,
  streetViewEmbedUrl,
  tileBoxes,
} from "@/lib/panorama-sources";

const TA_XUA = { lat: 21.33, lng: 104.48 };

describe("bboxAround", () => {
  it("is ordered minLng,minLat,maxLng,maxLat and centred on the point", () => {
    const [minLng, minLat, maxLng, maxLat] = bboxAround(TA_XUA.lat, TA_XUA.lng, 2);
    expect(minLng).toBeLessThan(TA_XUA.lng);
    expect(maxLng).toBeGreaterThan(TA_XUA.lng);
    expect(minLat).toBeLessThan(TA_XUA.lat);
    expect(maxLat).toBeGreaterThan(TA_XUA.lat);
    expect((minLat + maxLat) / 2).toBeCloseTo(TA_XUA.lat, 5);
    expect((minLng + maxLng) / 2).toBeCloseTo(TA_XUA.lng, 5);
  });

  it("spans the requested radius on both axes", () => {
    const [minLng, minLat, maxLng, maxLat] = bboxAround(TA_XUA.lat, TA_XUA.lng, 5);
    expect(haversineKm(minLat, TA_XUA.lng, TA_XUA.lat, TA_XUA.lng)).toBeCloseTo(5, 1);
    expect(haversineKm(TA_XUA.lat, maxLng, TA_XUA.lat, TA_XUA.lng)).toBeCloseTo(5, 1);
    // Small boxes keep the Graph API query fast; the route never asks for more than 5 km.
    expect((maxLng - minLng) * (maxLat - minLat)).toBeLessThan(0.01);
  });

  it("clamps at the poles and the antimeridian", () => {
    const [minLng, , , maxLat] = bboxAround(89.99, -179.99, 10);
    expect(maxLat).toBeLessThanOrEqual(90);
    expect(minLng).toBeGreaterThanOrEqual(-180);
  });

  it("is what the Mapillary query sends", () => {
    const url = new URL(mapillaryQueryUrl(bboxAround(TA_XUA.lat, TA_XUA.lng, 2)));
    expect(url.searchParams.get("is_pano")).toBe("true");
    expect(url.searchParams.get("bbox")?.split(",")).toHaveLength(4);
    expect(url.searchParams.get("fields")).toContain("thumb_2048_url");
    expect(url.search).not.toContain("access_token");
  });
});

describe("pickNearest", () => {
  it("picks the closest point and reports its distance", () => {
    const best = pickNearest(
      [
        { id: "far", lat: 21.4, lng: 104.6 },
        { id: "near", lat: 21.331, lng: 104.481 },
        { id: "bad", lat: Number.NaN, lng: 104.48 },
      ],
      TA_XUA.lat,
      TA_XUA.lng,
    );
    expect(best?.id).toBe("near");
    expect(best?.distanceKm).toBeLessThan(0.2);
  });

  it("returns null for an empty list", () => expect(pickNearest([], 0, 0)).toBeNull());
});

describe("nearestMapillary", () => {
  const fixture = {
    data: [
      { id: "1", is_pano: true, thumb_2048_url: "https://cdn.example/1.jpg", computed_geometry: { type: "Point", coordinates: [104.52, 21.35] }, creator: { username: "far" } },
      { id: "2", is_pano: true, thumb_2048_url: "https://cdn.example/2.jpg", computed_geometry: { type: "Point", coordinates: [104.481, 21.331] }, captured_at: 1700000000000, creator: { username: "near" } },
      { id: "3", is_pano: false, thumb_2048_url: "https://cdn.example/3.jpg", computed_geometry: { type: "Point", coordinates: [104.48, 21.33] } },
      { id: "4", is_pano: true, computed_geometry: { type: "Point", coordinates: [104.48, 21.33] } },
    ],
  };

  it("picks the nearest pano with an image, ignoring non-panos and missing thumbs", () => {
    const p = nearestMapillary(fixture, TA_XUA.lat, TA_XUA.lng)!;
    expect(p.src).toBe("https://cdn.example/2.jpg");
    expect(p.author).toBe("near");
    expect(p.license).toBe("CC BY-SA 4.0");
    expect(p.pageUrl).toContain("pKey=2");
    expect(p.capturedAt).toBe("2023-11-14T22:13:20.000Z");
  });

  it("falls back to the original geometry and to the 1024 thumb", () => {
    const p = nearestMapillary(
      { data: [{ id: "x", is_pano: true, thumb_1024_url: "https://cdn.example/x.jpg", geometry: { type: "Point", coordinates: [104.48, 21.33] } }] },
      TA_XUA.lat,
      TA_XUA.lng,
    );
    expect(p?.src).toBe("https://cdn.example/x.jpg");
    expect(p?.author).toBe("");
  });

  it.each([null, {}, { data: "nope" }, { data: [] }, { error: { message: "Invalid OAuth access token" } }])("returns null for %j", (body) =>
    expect(nearestMapillary(body, TA_XUA.lat, TA_XUA.lng)).toBeNull(),
  );
});

describe("isEquirectangular", () => {
  it.each([
    [8192, 4096, [], true],
    [6000, 3000, [], true],
    [6080, 3040, [], true],
    [5622, 2846, ["Category:Panoramas of Vietnam"], false],
    [4775, 682, [], false],
    [4032, 2268, [], false],
    [5600, 2800 * 1.02, ["Category:360° panoramas"], true],
    [5600, 2800 * 1.02, [], false],
    [800, 400, [], false],
  ])("%s×%s %j → %s", (w, h, cats, expected) => expect(isEquirectangular(w, h, cats)).toBe(expected));

  it("rejects missing sizes", () => expect(isEquirectangular(undefined, 100)).toBe(false));
});

describe("commonsPanoramas", () => {
  const page = (title: string, width: number, height: number, lat: number, lon: number, extra: Record<string, unknown> = {}) => ({
    pageid: title.length,
    title: `File:${title}.jpg`,
    coordinates: [{ lat, lon }],
    imageinfo: [
      {
        width,
        height,
        mime: "image/jpeg",
        url: `https://upload.wikimedia.org/${title}.jpg`,
        thumburl: `https://upload.wikimedia.org/thumb/${title}.jpg`,
        descriptionurl: `https://commons.wikimedia.org/wiki/File:${title}.jpg`,
        extmetadata: {
          LicenseShortName: { value: "CC BY-SA 4.0" },
          LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/4.0" },
          Artist: { value: '<a href="//commons.wikimedia.org/wiki/User:Someone">Some&nbsp;One</a>' },
        },
        ...extra,
      },
    ],
  });

  const geosearch = {
    query: {
      pages: [
        page("Wide crop", 4775, 682, 21.331, 104.481),
        page("Far sphere", 8000, 4000, 21.4, 104.55),
        page("Near sphere", 6000, 3000, 21.335, 104.485),
        page("Portrait", 2268, 4032, 21.33, 104.48),
        page("Unlicensed sphere", 6000, 3000, 21.33, 104.48, { extmetadata: {} }),
        page("Tiff sphere", 6000, 3000, 21.33, 104.48, { mime: "image/tiff" }),
      ],
    },
  };

  it("keeps only licensed 2:1 bitmaps, nearest first, with plain-text attribution", () => {
    const out = commonsPanoramas(geosearch, TA_XUA.lat, TA_XUA.lng);
    expect(out.map((p) => p.title)).toEqual(["Near sphere", "Far sphere"]);
    expect(out[0].author).toBe("Some One");
    expect(out[0].license).toBe("CC BY-SA 4.0");
    expect(out[0].src).toContain("/thumb/");
    expect(out[0].pageUrl).toContain("commons.wikimedia.org/wiki/File:");
  });

  it("merges several responses without duplicates", () => {
    const search = { query: { pages: [page("Near sphere", 6000, 3000, 21.335, 104.485)] } };
    expect(commonsPanoramas([search, geosearch], TA_XUA.lat, TA_XUA.lng)).toHaveLength(2);
  });

  it.each([null, {}, { query: {} }, { error: { code: "maxlag" } }])("returns [] for %j", (body) =>
    expect(commonsPanoramas(body, 0, 0)).toEqual([]),
  );

  it("builds query URLs with the pipe-separated coordinate and the Pano360 search", () => {
    expect(new URL(commonsGeosearchUrl(21.33, 104.48)).searchParams.get("ggscoord")).toBe("21.33|104.48");
    expect(new URL(commonsGeosearchUrl(0, 0, 50000)).searchParams.get("ggsradius")).toBe("10000");
    expect(new URL(commonsPano360SearchUrl(21.33, 104.48)).searchParams.get("gsrsearch")).toBe("nearcoord:25km,21.33,104.48 hastemplate:Pano360 filetype:bitmap");
  });
});

describe("streetViewEmbedUrl", () => {
  it("uses the official embed endpoint with clamped fov", () => {
    const url = new URL(streetViewEmbedUrl("TEST_KEY", 21.33, 104.48, { fov: 150, language: "vi" }));
    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/embed/v1/streetview");
    expect(url.searchParams.get("location")).toBe("21.33,104.48");
    expect(url.searchParams.get("fov")).toBe("100");
    expect(url.searchParams.get("language")).toBe("vi");
  });

  it("pins a known panorama by id instead of the raw coordinate", () => {
    const url = new URL(streetViewEmbedUrl("TEST_KEY", 21.33, 104.48, { pano: "PANO_ID" }));
    expect(url.searchParams.get("pano")).toBe("PANO_ID");
    expect(url.searchParams.has("location")).toBe(false);
  });
});

describe("tileBoxes", () => {
  it("returns the single box when the radius fits one tile", () => {
    expect(tileBoxes(TA_XUA.lat, TA_XUA.lng, 5, 5)).toEqual([bboxAround(TA_XUA.lat, TA_XUA.lng, 5)]);
  });

  it("covers a wider radius with tiles no bigger than the tile size", () => {
    const tiles = tileBoxes(TA_XUA.lat, TA_XUA.lng, 15, 5);
    expect(tiles).toHaveLength(9);
    const outer = bboxAround(TA_XUA.lat, TA_XUA.lng, 15);
    const one = bboxAround(TA_XUA.lat, TA_XUA.lng, 5);
    for (const [a, b, c, d] of tiles) {
      expect(c - a).toBeCloseTo(one[2] - one[0], 5);
      expect(d - b).toBeCloseTo(one[3] - one[1], 5);
    }
    expect(Math.min(...tiles.map((t) => t[0]))).toBeCloseTo(outer[0], 5);
    expect(Math.max(...tiles.map((t) => t[3]))).toBeCloseTo(outer[3], 5);
  });
});
