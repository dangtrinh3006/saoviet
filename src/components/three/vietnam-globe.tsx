"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

type Point = { lat: number; lng: number; weight?: number };

// cobe faces longitude L when phi = π − (L − 90°) in radians; 106°E ≈ Vietnam.
const VIETNAM_PHI = Math.PI - ((106 - 90) * Math.PI) / 180;
const THEMES = {
  dark: { dark: 1, base: [0.1, 0.11, 0.24], marker: [0.49, 1, 0.77], glow: [0.32, 0.26, 0.7], bright: 5 },
  light: { dark: 0, base: [0.9, 0.93, 1], marker: [0.29, 0.24, 0.96], glow: [0.8, 0.85, 1], bright: 1.6 },
  red: { dark: 1, base: [0.18, 0.02, 0.02], marker: [1, 0.35, 0.27], glow: [0.25, 0.03, 0.03], bright: 4 },
} as const;

export function VietnamGlobe({ points, className }: { points: Point[]; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; phi: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let phi = VIETNAM_PHI - 0.6;
    let width = canvas.offsetWidth;
    let frame = 0;

    const theme = () => THEMES[(document.documentElement.dataset.theme as keyof typeof THEMES) ?? "dark"] ?? THEMES.dark;
    const palette = (t = theme()) => ({
      dark: t.dark,
      baseColor: [...t.base] as [number, number, number],
      markerColor: [...t.marker] as [number, number, number],
      glowColor: [...t.glow] as [number, number, number],
      mapBrightness: t.bright,
    });

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio, 2),
      width: width * 2,
      height: width * 2,
      phi,
      theta: 0.3,
      diffuse: 1.4,
      mapSamples: 22000,
      mapBaseBrightness: 0.02,
      markers: points.map((p) => ({ location: [p.lat, p.lng], size: 0.03 + (p.weight ?? 0) * 0.04 })),
      markerElevation: 0.02,
      ...palette(),
      opacity: 0.92,
    });

    const onResize = () => (width = canvas.offsetWidth);
    window.addEventListener("resize", onResize);
    const obs = new MutationObserver(() => globe.update(palette()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const tick = () => {
      // Ease towards Vietnam, then idle-rotate slowly unless the user is dragging.
      if (!drag.current) phi += reduced ? 0 : (VIETNAM_PHI - phi) * 0.02 + 0.0009;
      globe.update({ phi, width: width * 2, height: width * 2 });
      frame = requestAnimationFrame(tick);
    };
    tick();
    requestAnimationFrame(() => (canvas.style.opacity = "1"));

    const down = (e: PointerEvent) => (drag.current = { x: e.clientX, phi });
    const move = (e: PointerEvent) => {
      if (drag.current) phi = drag.current.phi + (e.clientX - drag.current.x) / 220;
    };
    const up = () => (drag.current = null);
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    return () => {
      cancelAnimationFrame(frame);
      obs.disconnect();
      globe.destroy();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [points]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", aspectRatio: "1", opacity: 0, transition: "opacity 1.2s ease", cursor: "grab", touchAction: "pan-y" }}
      aria-label="Vietnam stargazing locations globe"
    />
  );
}
