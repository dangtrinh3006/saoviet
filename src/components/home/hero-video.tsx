"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { heroVideos } from "@/content/media";
import { useMounted } from "@/lib/use-client";

const SLIDE_MS = 9000;
const FADE_MS = 1600;

/** Plays video only where it is cheap and wanted: wide screens, motion allowed, no Save-Data. */
function useVideoAllowed() {
  const mounted = useMounted();
  return useMemo(() => {
    if (!mounted) return false;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    return (
      window.matchMedia("(min-width: 768px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !conn?.saveData
    );
  }, [mounted]);
}

export function HeroVideo() {
  const allowed = useVideoAllowed();
  const [index, setIndex] = useState(0);
  // Two stacked players: the hidden one preloads the next clip, then they swap opacity.
  const playerA = useRef<HTMLVideoElement>(null);
  const playerB = useRef<HTMLVideoElement>(null);
  const [front, setFront] = useState(0);

  useEffect(() => {
    if (!allowed || heroVideos.length < 2) return;
    const id = setInterval(() => {
      const next = (index + 1) % heroVideos.length;
      const back = (front === 0 ? playerB : playerA).current;
      if (!back) return;
      back.src = heroVideos[next].src;
      back.currentTime = 0;
      back.play().catch(() => {});
      setFront(1 - front);
      setIndex(next);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [allowed, index, front]);

  const current = heroVideos[index];
  if (!current) return null;

  return (
    <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden>
      {/* Poster is the LCP and the only layer on mobile / reduced motion. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={heroVideos[0].poster} alt="" className="absolute inset-0 size-full object-cover opacity-60" />
      {allowed && (
        <>
          <video
            ref={playerA}
            src={heroVideos[0].src}
            poster={heroVideos[0].poster}
            muted
            playsInline
            loop
            autoPlay
            preload="auto"
            className="absolute inset-0 size-full object-cover transition-opacity ease-out"
            style={{ opacity: front === 0 ? 0.75 : 0, transitionDuration: `${FADE_MS}ms` }}
          />
          <video
            ref={playerB}
            muted
            playsInline
            loop
            preload="none"
            className="absolute inset-0 size-full object-cover transition-opacity ease-out"
            style={{ opacity: front === 1 ? 0.75 : 0, transitionDuration: `${FADE_MS}ms` }}
          />
        </>
      )}
      {/* Scrim keeps the headline legible over any frame, in every theme. */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--bg) 55%, transparent) 0%, color-mix(in oklab, var(--bg) 35%, transparent) 45%, var(--bg) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, color-mix(in oklab, var(--bg) 80%, transparent) 0%, transparent 65%)" }} />
      <p className="readout pointer-events-auto absolute bottom-3 right-4 text-[10px] text-white/55">
        ▶ {current.credit} · {current.license}
      </p>
    </div>
  );
}
