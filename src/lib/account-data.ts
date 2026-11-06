type Row = Record<string, unknown>;

export type ExportSource = {
  user: Row & { id: string; name: string; email: string };
  accounts: (Row & { providerId: string })[];
  sessions: Row[];
  orders: Row[];
  reviews: Row[];
  comments: Row[];
  threads: Row[];
  exportedAt: Date;
};

const pickKeys = (row: Row, keys: string[]) => Object.fromEntries(keys.filter((k) => k in row).map((k) => [k, row[k]]));

/** Allow-list, not deny-list: a new secret column can never leak into a download by default. */
export function buildExport(s: ExportSource) {
  return {
    exportedAt: s.exportedAt.toISOString(),
    profile: pickKeys(s.user, ["id", "name", "email", "emailVerified", "image", "role", "createdAt"]),
    signInMethods: [...new Set(s.accounts.map((a) => a.providerId))],
    sessions: s.sessions.map((r) => pickKeys(r, ["createdAt", "expiresAt", "ipAddress", "userAgent"])),
    orders: s.orders,
    reviews: s.reviews,
    comments: s.comments,
    threads: s.threads,
  };
}

/** Placeholder owner for content a leaving user chose to keep; `.invalid` can never receive mail (RFC 2606). */
export function anonymousIdentity(seed: string) {
  return { name: "Người dùng đã xoá tài khoản", email: `deleted-${seed}@deleted.invalid` };
}
