import { describe, expect, it } from "vitest";
import { checkBanChange, checkRoleChange } from "@/lib/admin-guards";

const base = { actorId: "a1", targetId: "u1", adminCount: 2 };

describe("checkRoleChange", () => {
  it("allows promoting a user and demoting another admin", () => {
    expect(checkRoleChange({ ...base, currentRole: "user", nextRole: "admin" })).toBeNull();
    expect(checkRoleChange({ ...base, currentRole: "admin", nextRole: "user" })).toBeNull();
  });

  it("rejects a no-op change", () => {
    expect(checkRoleChange({ ...base, currentRole: "admin", nextRole: "admin" })).toBe("unchanged");
  });

  it("stops admins from demoting themselves", () => {
    expect(checkRoleChange({ ...base, targetId: "a1", currentRole: "admin", nextRole: "user" })).toBe("self");
  });

  it("never removes the last admin", () => {
    expect(checkRoleChange({ ...base, adminCount: 1, currentRole: "admin", nextRole: "user" })).toBe("lastAdmin");
  });
});

describe("checkBanChange", () => {
  it("allows banning and unbanning a regular user", () => {
    expect(checkBanChange({ ...base, targetRole: "user", banned: false, nextBanned: true })).toBeNull();
    expect(checkBanChange({ ...base, targetRole: "user", banned: true, nextBanned: false })).toBeNull();
  });

  it("refuses to ban yourself or another admin", () => {
    expect(checkBanChange({ ...base, targetId: "a1", targetRole: "admin", banned: false, nextBanned: true })).toBe("self");
    expect(checkBanChange({ ...base, targetRole: "admin", banned: false, nextBanned: true })).toBe("adminTarget");
  });

  it("rejects a no-op change", () => {
    expect(checkBanChange({ ...base, targetRole: "user", banned: true, nextBanned: true })).toBe("unchanged");
  });
});
