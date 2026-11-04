import { describe, expect, it } from "vitest";
import { aqiLevel, bortleFromSqm, brightnessRatio, darkWindow, moonInfo, tonightScore } from "@/lib/sky";

describe("bortleFromSqm", () => {
  it.each([
    [22.0, 1],
    [21.9, 2],
    [21.72, 3],
    [21.2, 4],
    [20.2, 5],
    [19.2, 6],
    [18.5, 7],
    [17.5, 8],
  ])("SQM %s → Bortle %s", (sqm, bortle) => expect(bortleFromSqm(sqm)).toBe(bortle));
});

describe("brightnessRatio", () => {
  it("is 1 for a natural sky and ×10 for 2.5 magnitudes brighter", () => {
    expect(brightnessRatio(22)).toBeCloseTo(1);
    expect(brightnessRatio(19.5)).toBeCloseTo(10);
  });
});

describe("moonInfo", () => {
  it("knows a full moon and a new moon", () => {
    // 2026-03-03 full moon (lunar eclipse); 2026-03-19 new moon.
    expect(moonInfo(new Date("2026-03-03T12:00:00Z")).illumination).toBeGreaterThan(0.97);
    expect(moonInfo(new Date("2026-03-19T01:00:00Z")).illumination).toBeLessThan(0.03);
  });
});

describe("darkWindow", () => {
  it("returns astronomical night for Tà Xùa that starts in the evening and ends before dawn", () => {
    const w = darkWindow(21.33, 104.48, 1900, new Date("2026-11-04T05:00:00Z"));
    expect(w.start).not.toBeNull();
    expect(w.end).not.toBeNull();
    const startHour = Number(w.start!.toLocaleTimeString("en-GB", { hour: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }));
    expect(startHour).toBeGreaterThanOrEqual(18);
    expect(startHour).toBeLessThanOrEqual(19);
    expect(w.end!.getTime()).toBeGreaterThan(w.start!.getTime());
  });
});

describe("tonightScore", () => {
  const dark = { phaseDeg: 0, illumination: 0, name: "new" as const };
  const full = { phaseDeg: 180, illumination: 1, name: "full" as const };
  it("prefers clear, moonless, dark sites", () => {
    expect(tonightScore(21.9, 0, dark)).toBeGreaterThan(tonightScore(21.9, 80, dark));
    expect(tonightScore(21.9, 0, dark)).toBeGreaterThan(tonightScore(21.9, 0, full));
    expect(tonightScore(21.9, 0, dark)).toBeGreaterThan(tonightScore(19, 0, dark));
  });
  it("stays within 0–100", () => {
    expect(tonightScore(22, 0, dark)).toBeLessThanOrEqual(100);
    expect(tonightScore(16, 100, full)).toBeGreaterThanOrEqual(0);
  });
});

describe("aqiLevel", () => {
  it("maps US AQI bands and unknown", () => {
    expect(aqiLevel(null)).toBe("unknown");
    expect(aqiLevel(40)).toBe("good");
    expect(aqiLevel(90)).toBe("moderate");
    expect(aqiLevel(140)).toBe("sensitive");
    expect(aqiLevel(200)).toBe("unhealthy");
  });
});
