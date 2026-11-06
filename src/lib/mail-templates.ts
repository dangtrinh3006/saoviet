import en from "../../messages/extra/auth.en.json";
import vi from "../../messages/extra/auth.vi.json";

// Emails go out before the recipient's locale is known, so every mail carries both languages.
type MailCopy = (typeof vi)["authx"]["mail"];
const COPY = { vi: vi.authx.mail, en: en.authx.mail } satisfies Record<"vi" | "en", MailCopy>;
const LOCALES = ["vi", "en"] as const;

const C = { bg: "#04050c", card: "#0a0c18", line: "#1c2036", ink: "#eef0ff", muted: "#9097b8", accent: "#7dffc4", accentInk: "#03140c" };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m));
}

function layout(title: string, sections: string[]) {
  const body = sections.join(`<hr style="border:none;border-top:1px solid ${C.line};margin:32px 0">`);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};color:${C.ink};font-family:${FONT}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.card};border:1px solid ${C.line};border-radius:20px">
<tr><td style="padding:28px 28px 0;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:${C.accent}">&#9733; ${escapeHtml(COPY.vi.brand)}</td></tr>
<tr><td style="padding:20px 28px 32px;font-size:15px;line-height:1.6">${body}</td></tr>
</table></td></tr></table></body></html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:${C.accent};color:${C.accentInk};text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${escapeHtml(label)}</a></p>`;
}

export type RenderedMail = { subject: string; html: string; text: string };

export function resetPasswordMail({ name, url }: { name: string; url: string }): RenderedMail {
  const subject = `${COPY.vi.reset.subject} · ${COPY.en.reset.subject} — ${COPY.vi.brand}`;
  const sections = LOCALES.map((l) => {
    const c = COPY[l].reset;
    return `<h1 style="margin:0 0 16px;font-size:22px;color:${C.ink}">${escapeHtml(c.subject)}</h1>
<p style="margin:0 0 12px">${escapeHtml(fill(c.greeting, { name }))}</p>
<p style="margin:0;color:${C.muted}">${escapeHtml(c.body)}</p>${button(url, c.button)}
<p style="margin:0 0 6px;font-size:13px;color:${C.muted}">${escapeHtml(c.fallback)}</p>
<p style="margin:0 0 16px;font-size:12px;word-break:break-all"><a href="${escapeHtml(url)}" style="color:${C.accent}">${escapeHtml(url)}</a></p>
<p style="margin:0;font-size:13px;color:${C.muted}">${escapeHtml(c.ignore)}</p>`;
  });
  const text = LOCALES.map((l) => {
    const c = COPY[l].reset;
    return [c.subject, "", fill(c.greeting, { name }), "", c.body, "", `${c.button}: ${url}`, "", c.ignore].join("\n");
  }).join("\n\n----\n\n");
  return { subject, html: layout(subject, sections), text };
}

export type BookingMailData = {
  name: string;
  code: string;
  tourTitle: Record<"vi" | "en", string>;
  departureDate: string;
  guests: number;
  total: Record<"vi" | "en", string>;
};

export function bookingConfirmationMail(d: BookingMailData): RenderedMail {
  const subject = `${fill(COPY.vi.booking.subject, { code: d.code })} · ${fill(COPY.en.booking.subject, { code: d.code })}`;
  const rows = (l: (typeof LOCALES)[number]) => {
    const c = COPY[l].booking;
    return [
      [c.code, d.code],
      [c.tour, d.tourTitle[l]],
      [c.date, d.departureDate],
      [c.guests, String(d.guests)],
      [c.total, d.total[l]],
    ] as const;
  };
  const sections = LOCALES.map((l) => {
    const c = COPY[l].booking;
    const table = rows(l)
      .map(([k, v]) => `<tr><td style="padding:8px 0;color:${C.muted};font-size:13px;border-bottom:1px solid ${C.line}">${escapeHtml(k)}</td><td align="right" style="padding:8px 0;font-family:ui-monospace,Menlo,Consolas,monospace;border-bottom:1px solid ${C.line}">${escapeHtml(v)}</td></tr>`)
      .join("");
    return `<h1 style="margin:0 0 16px;font-size:22px;color:${C.ink}">${escapeHtml(fill(c.subject, { code: d.code }))}</h1>
<p style="margin:0 0 12px">${escapeHtml(fill(c.greeting, { name: d.name }))}</p>
<p style="margin:0 0 16px;color:${C.muted}">${escapeHtml(c.body)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${table}</table>
<p style="margin:16px 0 0;font-size:13px;color:${C.muted}">${escapeHtml(c.footer)}</p>`;
  });
  const text = LOCALES.map((l) => {
    const c = COPY[l].booking;
    return [fill(c.subject, { code: d.code }), "", fill(c.greeting, { name: d.name }), "", c.body, "", ...rows(l).map(([k, v]) => `${k}: ${v}`), "", c.footer].join("\n");
  }).join("\n\n----\n\n");
  return { subject, html: layout(subject, sections), text };
}

export type NotifiedStatus = "confirmed" | "completed" | "cancelled";

export type OrderStatusMailData = {
  name: string;
  code: string;
  status: NotifiedStatus;
  tourTitle: Record<"vi" | "en", string>;
  departureDate: string;
};

export function orderStatusMail(d: OrderStatusMailData): RenderedMail {
  const head = (l: (typeof LOCALES)[number]) => fill(COPY[l].orderStatus.subject, { code: d.code, status: COPY[l].orderStatus.statuses[d.status] });
  const subject = `${head("vi")} · ${head("en")}`;
  const rows = (l: (typeof LOCALES)[number]) => {
    const c = COPY[l].orderStatus;
    return [
      [c.tour, d.tourTitle[l]],
      [c.date, d.departureDate],
    ] as const;
  };
  const sections = LOCALES.map((l) => {
    const c = COPY[l].orderStatus;
    const table = rows(l)
      .map(([k, v]) => `<tr><td style="padding:8px 0;color:${C.muted};font-size:13px;border-bottom:1px solid ${C.line}">${escapeHtml(k)}</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line}">${escapeHtml(v)}</td></tr>`)
      .join("");
    return `<h1 style="margin:0 0 16px;font-size:22px;color:${C.ink}">${escapeHtml(head(l))}</h1>
<p style="margin:0 0 12px">${escapeHtml(fill(c.greeting, { name: d.name }))}</p>
<p style="margin:0 0 16px;color:${C.muted}">${escapeHtml(c.body[d.status])}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${table}</table>
<p style="margin:16px 0 0;font-size:13px;color:${C.muted}">${escapeHtml(c.footer)}</p>`;
  });
  const text = LOCALES.map((l) => {
    const c = COPY[l].orderStatus;
    return [head(l), "", fill(c.greeting, { name: d.name }), "", c.body[d.status], "", ...rows(l).map(([k, v]) => `${k}: ${v}`), "", c.footer].join("\n");
  }).join("\n\n----\n\n");
  return { subject, html: layout(subject, sections), text };
}
