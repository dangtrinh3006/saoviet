export type Role = "user" | "admin";
export type GuardError = "unchanged" | "self" | "lastAdmin" | "adminTarget";

type Base = { actorId: string; targetId: string; adminCount: number };

/** Null when the role change is allowed. Keeps at least one admin and never lets an admin lock themselves out. */
export function checkRoleChange(p: Base & { currentRole: Role; nextRole: Role }): GuardError | null {
  if (p.currentRole === p.nextRole) return "unchanged";
  if (p.nextRole === "user" && p.targetId === p.actorId) return "self";
  if (p.nextRole === "user" && p.adminCount <= 1) return "lastAdmin";
  return null;
}

/** Admins must be demoted before a ban, so a ban can never strand the site without an admin. */
export function checkBanChange(p: Base & { targetRole: Role; banned: boolean; nextBanned: boolean }): GuardError | null {
  if (p.banned === p.nextBanned) return "unchanged";
  if (p.nextBanned && p.targetId === p.actorId) return "self";
  if (p.nextBanned && p.targetRole === "admin") return "adminTarget";
  return null;
}
