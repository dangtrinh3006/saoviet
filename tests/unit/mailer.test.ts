import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Records every insert/update the mailer issues, without a real database.
const calls = vi.hoisted(() => ({ inserts: [] as unknown[], updates: [] as unknown[] }));

vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({
  schema: { mailOutbox: { id: "id" } },
  db: {
    insert: () => ({ values: async (row: unknown) => void calls.inserts.push(row) }),
    update: () => ({ set: (patch: unknown) => ({ where: async () => void calls.updates.push(patch) }) }),
  },
}));

import { bookingConfirmationMail, escapeHtml, resetPasswordMail } from "@/lib/mail-templates";
import { sendMail } from "@/lib/mailer";

const mail = { to: "user@saoviet.test", subject: "Subject", html: "<p>Hi</p>", text: "Hi", kind: "reset-password" as const };

describe("sendMail", () => {
  beforeEach(() => {
    calls.inserts.length = 0;
    calls.updates.length = 0;
    vi.stubEnv("RESEND_API_KEY", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("writes an outbox row and stays queued when no API key is set", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await sendMail(mail);
    expect(res.status).toBe("queued");
    expect(calls.inserts).toEqual([expect.objectContaining({ ...mail, status: "queued", id: res.id })]);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(calls.updates).toEqual([]);
  });

  it("marks the row sent after Resend accepts it", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key-not-real");
    const fetchSpy = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);
    const res = await sendMail(mail);
    expect(res.status).toBe("sent");
    expect(calls.inserts).toHaveLength(1);
    expect(calls.updates).toEqual([{ status: "sent", error: null }]);
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(JSON.parse(String(init.body))).toMatchObject({ to: [mail.to], subject: mail.subject });
  });

  it("records a delivery failure instead of throwing", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key-not-real");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bad from", { status: 422 })));
    const res = await sendMail(mail);
    expect(res.status).toBe("failed");
    expect(calls.inserts).toHaveLength(1);
    expect(calls.updates).toEqual([{ status: "failed", error: expect.stringContaining("HTTP 422") }]);
  });

  it("records a network error instead of throwing", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key-not-real");
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("ECONNRESET"))));
    const res = await sendMail(mail);
    expect(res.status).toBe("failed");
    expect(calls.updates).toEqual([{ status: "failed", error: "ECONNRESET" }]);
  });
});

describe("mail templates", () => {
  it("reset mail is bilingual, carries the link in text and escapes the user name", () => {
    const url = "http://localhost:3100/api/auth/reset-password/abc?callbackURL=%2Fvi%2Freset-password";
    const m = resetPasswordMail({ name: "<b>Eve</b>", url });
    expect(m.subject).toContain("Đặt lại mật khẩu");
    expect(m.subject).toContain("Reset your password");
    expect(m.text).toContain(url);
    expect(m.html).toContain(escapeHtml("<b>Eve</b>"));
    expect(m.html).not.toContain("<b>Eve</b>");
  });

  it("booking mail lists code, tour, date, guests and total in both languages", () => {
    const m = bookingConfirmationMail({
      name: "An",
      code: "SV-ABC234",
      tourTitle: { vi: "Tà Xùa", en: "Ta Xua" },
      departureDate: "2026-12-24",
      guests: 3,
      total: { vi: "1.000 ₫", en: "₫1,000" },
    });
    expect(m.subject).toContain("SV-ABC234");
    for (const s of ["Tà Xùa", "Ta Xua", "2026-12-24", "Số khách: 3", "Guests: 3", "1.000 ₫", "₫1,000"]) expect(m.text).toContain(s);
  });
});

describe("authx messages", () => {
  it("vi and en define the same keys", async () => {
    const keys = (o: object, p = ""): string[] =>
      Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`]));
    const vi = (await import("../../messages/extra/auth.vi.json")).default;
    const en = (await import("../../messages/extra/auth.en.json")).default;
    expect(keys(vi).sort()).toEqual(keys(en).sort());
  });
});
