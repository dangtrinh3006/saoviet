import { describe, expect, it } from "vitest";
import { MIN_PASSWORD_LENGTH, newPasswordError } from "@/lib/password-check";

describe("newPasswordError", () => {
  it("accepts a long enough password typed twice the same", () => {
    expect(newPasswordError("sao-viet-2026", "sao-viet-2026")).toBeNull();
  });

  it("rejects a short password before comparing", () => {
    expect(newPasswordError("short", "short")).toBe("tooShort");
    expect("x".repeat(MIN_PASSWORD_LENGTH)).toHaveLength(8);
  });

  it("rejects when the confirmation differs, including by case or trailing space", () => {
    expect(newPasswordError("sao-viet-2026", "Sao-viet-2026")).toBe("mismatch");
    expect(newPasswordError("sao-viet-2026", "sao-viet-2026 ")).toBe("mismatch");
  });
});
