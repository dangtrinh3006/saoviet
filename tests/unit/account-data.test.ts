import { describe, expect, it } from "vitest";
import { anonymousIdentity, buildExport } from "@/lib/account-data";

const now = new Date("2026-11-06T10:00:00Z");

describe("buildExport", () => {
  const out = buildExport({
    user: { id: "u1", name: "Lan", email: "lan@test.vn", emailVerified: true, image: null, role: "user", createdAt: now, password: "hash", banReason: null },
    accounts: [{ providerId: "credential", createdAt: now, password: "scrypt$hash", accessToken: "oauth-access-token", idToken: "oauth-id-token" }],
    sessions: [{ createdAt: now, expiresAt: now, ipAddress: "1.2.3.4", userAgent: "UA", token: "secret-session" }],
    orders: [{ code: "SV-1", tourSlug: "ta-xua", status: "pending", totalVnd: 1 }],
    reviews: [],
    comments: [],
    threads: [],
    exportedAt: now,
  });
  const json = JSON.stringify(out);

  it("never contains password hashes, OAuth tokens or session tokens", () => {
    for (const secret of ["scrypt$hash", "oauth-access-token", "oauth-id-token", "secret-session", "\"hash\""]) expect(json).not.toContain(secret);
  });

  it("keeps the personal data the user is entitled to", () => {
    expect(out.profile).toMatchObject({ name: "Lan", email: "lan@test.vn" });
    expect(out.signInMethods).toEqual(["credential"]);
    expect(out.sessions[0]).toMatchObject({ ipAddress: "1.2.3.4", userAgent: "UA" });
    expect(out.orders).toHaveLength(1);
    expect(out.exportedAt).toBe(now.toISOString());
  });
});

describe("anonymousIdentity", () => {
  it("is unique per account and can never receive mail", () => {
    const a = anonymousIdentity("abc");
    expect(a.email).toMatch(/@deleted\.invalid$/);
    expect(anonymousIdentity("xyz").email).not.toBe(a.email);
  });
});
