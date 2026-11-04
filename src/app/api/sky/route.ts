import { NextResponse } from "next/server";
import { locations } from "@/content/locations";
import type { SkyConditions } from "@/lib/sky";

// One batched upstream call for every location, cached for 30 minutes: Open-Meteo's
// free tier is rate-limited per IP and the model only updates hourly anyway.
const REVALIDATE = 1800;

type AqResponse = { current?: { us_aqi?: number; pm2_5?: number } };
type WxResponse = { hourly?: { time: string[]; cloud_cover: number[] } };

const asArray = <T,>(v: T | T[]) => (Array.isArray(v) ? v : [v]);

function tonight(hourly: WxResponse["hourly"]) {
  if (!hourly) return { mean: null, series: [] as { time: string; value: number }[] };
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  const series = hourly.time
    .map((time, i) => ({ time, value: hourly.cloud_cover[i] }))
    .filter(({ time }) => {
      const [d, h] = [time.slice(0, 10), Number(time.slice(11, 13))];
      return (d === today && h >= 19) || (d > today && h <= 4);
    })
    .slice(0, 10);
  const mean = series.length ? Math.round(series.reduce((a, b) => a + b.value, 0) / series.length) : null;
  return { mean, series };
}

export async function GET() {
  const lat = locations.map((l) => l.lat).join(",");
  const lng = locations.map((l) => l.lng).join(",");
  try {
    const [aqRes, wxRes] = await Promise.all([
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm2_5`,
        { next: { revalidate: REVALIDATE } },
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=cloud_cover&forecast_days=2&timezone=Asia%2FHo_Chi_Minh`,
        { next: { revalidate: REVALIDATE } },
      ),
    ]);
    if (!aqRes.ok || !wxRes.ok) throw new Error(`upstream ${aqRes.status}/${wxRes.status}`);
    const aq = asArray((await aqRes.json()) as AqResponse | AqResponse[]);
    const wx = asArray((await wxRes.json()) as WxResponse | WxResponse[]);

    const data: Record<string, SkyConditions> = {};
    locations.forEach((loc, i) => {
      const t = tonight(wx[i]?.hourly);
      data[loc.slug] = {
        aqi: aq[i]?.current?.us_aqi ?? null,
        pm25: aq[i]?.current?.pm2_5 ?? null,
        clouds: t.mean,
        cloudHourly: t.series,
      };
    });
    return NextResponse.json(
      { updatedAt: new Date().toISOString(), data },
      { headers: { "Cache-Control": `public, s-maxage=${REVALIDATE}, stale-while-revalidate=3600` } },
    );
  } catch (err) {
    // Degrade to "unavailable" in the UI rather than failing the page.
    return NextResponse.json({ updatedAt: null, data: {}, error: String(err) }, { status: 502 });
  }
}
