import { Body, Illumination, MoonPhase, Observer, SearchAltitude, SearchRiseSet } from "astronomy-engine";

export interface MoonInfo {
  /** 0 new → 180 full → 360 */
  phaseDeg: number;
  illumination: number;
  name: "new" | "waxingCrescent" | "firstQuarter" | "waxingGibbous" | "full" | "waningGibbous" | "lastQuarter" | "waningCrescent";
}

export function moonInfo(date = new Date()): MoonInfo {
  const phaseDeg = MoonPhase(date);
  const illumination = Illumination(Body.Moon, date).phase_fraction;
  const names: MoonInfo["name"][] = [
    "new",
    "waxingCrescent",
    "firstQuarter",
    "waxingGibbous",
    "full",
    "waningGibbous",
    "lastQuarter",
    "waningCrescent",
  ];
  return { phaseDeg, illumination, name: names[Math.round(phaseDeg / 45) % 8] };
}

export interface DarkWindow {
  start: Date | null;
  end: Date | null;
  moonrise: Date | null;
  moonset: Date | null;
}

/** Astronomical darkness (Sun below −18°) for the night starting on `date`. */
export function darkWindow(lat: number, lng: number, elevation = 0, date = new Date()): DarkWindow {
  const observer = new Observer(lat, lng, elevation);
  const noon = new Date(date);
  noon.setHours(12, 0, 0, 0);
  const start = SearchAltitude(Body.Sun, observer, -1, noon, 1, -18)?.date ?? null;
  const end = start ? (SearchAltitude(Body.Sun, observer, +1, start, 1, -18)?.date ?? null) : null;
  return {
    start,
    end,
    moonrise: SearchRiseSet(Body.Moon, observer, +1, noon, 1)?.date ?? null,
    moonset: SearchRiseSet(Body.Moon, observer, -1, noon, 1)?.date ?? null,
  };
}

/** Bortle bands from SQM (community convention, approximate). */
export function bortleFromSqm(sqm: number) {
  if (sqm >= 21.99) return 1;
  if (sqm >= 21.89) return 2;
  if (sqm >= 21.69) return 3;
  if (sqm >= 20.49) return 4;
  if (sqm >= 19.5) return 5;
  if (sqm >= 18.94) return 6;
  if (sqm >= 18.38) return 7;
  return 8;
}

/** Sky brightness relative to a natural dark sky (22.0 mag/arcsec²). */
export const brightnessRatio = (sqm: number) => Math.pow(10, (22 - sqm) / 2.5);

export interface SkyConditions {
  aqi: number | null;
  pm25: number | null;
  /** Mean cloud cover (%) over tonight 19:00–04:00 local. */
  clouds: number | null;
  cloudHourly: { time: string; value: number }[];
}

export function aqiLevel(aqi: number | null) {
  if (aqi == null) return "unknown" as const;
  if (aqi <= 50) return "good" as const;
  if (aqi <= 100) return "moderate" as const;
  if (aqi <= 150) return "sensitive" as const;
  return "unhealthy" as const;
}

/**
 * Tonight score 0–100: clouds weigh most, then moonlight, then the site's
 * baseline sky brightness. A planning aid, not a forecast guarantee.
 */
export function tonightScore(sqm: number, clouds: number | null, moon: MoonInfo) {
  const sky = Math.max(0, Math.min(1, (sqm - 18) / 4));
  const cloud = clouds == null ? 0.5 : 1 - clouds / 100;
  const dark = 1 - moon.illumination * 0.8;
  return Math.round(100 * (cloud * 0.55 + dark * 0.25 + sky * 0.2));
}
