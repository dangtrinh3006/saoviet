import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/safe-next";

describe("safeNext", () => {
  it("keeps locale-less same-site paths", () => {
    expect(safeNext("/admin")).toBe("/admin");
    expect(safeNext("/tours/ta-xua?x=1")).toBe("/tours/ta-xua?x=1");
  });

  it("strips a locale prefix because the i18n router adds it again", () => {
    expect(safeNext("/vi/admin")).toBe("/admin");
    expect(safeNext("/en")).toBe("/");
    expect(safeNext("/video")).toBe("/video");
  });

  it("rejects open redirects and empty input", () => {
    expect(safeNext(null)).toBe("/account");
    expect(safeNext("https://evil.test")).toBe("/account");
    expect(safeNext("//evil.test")).toBe("/account");
    expect(safeNext("/vi//evil.test")).toBe("/account");
  });
});
