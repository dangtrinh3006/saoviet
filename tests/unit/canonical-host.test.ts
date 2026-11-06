import { describe, expect, it } from "vitest";
import { canonicalUrl } from "@/lib/canonical-host";

describe("canonicalUrl", () => {
  const canonical = "saoviet.dangtrinh.dev";

  it("moves the old vercel.app alias to the canonical host, keeping path and query", () => {
    expect(canonicalUrl(new URL("https://saoviet-rho.vercel.app/vi/tours?x=1"), canonical)).toBe("https://saoviet.dangtrinh.dev/vi/tours?x=1");
  });

  it("leaves the canonical host, localhost and an unset canonical alone", () => {
    expect(canonicalUrl(new URL("https://saoviet.dangtrinh.dev/vi"), canonical)).toBeNull();
    expect(canonicalUrl(new URL("http://localhost:3100/vi"), canonical)).toBeNull();
    expect(canonicalUrl(new URL("https://saoviet-rho.vercel.app/vi"), undefined)).toBeNull();
  });
});
