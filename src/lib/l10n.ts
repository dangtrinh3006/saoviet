import type { L10n } from "@/content/types";

export const pick = (value: L10n, locale: string) => (locale === "en" ? value.en : value.vi);

export function formatVnd(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCoord(lat: number, lng: number) {
  const dms = (v: number, pos: string, neg: string) => {
    const a = Math.abs(v);
    const d = Math.floor(a);
    const m = Math.round((a - d) * 60);
    return `${d}°${String(m).padStart(2, "0")}′${v >= 0 ? pos : neg}`;
  };
  return `${dms(lat, "N", "S")} ${dms(lng, "E", "W")}`;
}
