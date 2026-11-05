"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { type RefObject, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Jeep } from "@/components/ui/icons";
import { useDocTheme } from "@/lib/use-client";

export type ItineraryStep = { title: string; body: string };

const ItineraryScene = dynamic(() => import("./itinerary-scene"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-surface/60" />,
});

const QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
let webglCache: boolean | null = null;

function hasWebGL() {
  if (webglCache === null) {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      webglCache = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}

function subscribeQuery(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** WebGL only on wide screens without reduced motion; SSR and first paint get the list. */
const useCan3D = () =>
  useSyncExternalStore(subscribeQuery, () => window.matchMedia(QUERY).matches && hasWebGL(), () => false);

/** Scroll through the list as a fractional step index: card i's top crossing the line means step i. */
function useStepProgress(target: RefObject<HTMLElement | null>, count: number, line = 0.6) {
  const { scrollYProgress } = useScroll({ target, offset: [`start ${line}`, `end ${line}`] });
  const progress = useTransform(scrollYProgress, (v) => Math.min(count - 1, Math.max(0, v * count)));
  const [active, setActive] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setActive(Math.min(count - 1, Math.floor(v + 0.02))));
  return { scrollYProgress, progress, active };
}

export function Itinerary3D({ steps, seedKey }: { steps: ItineraryStep[]; seedKey: string }) {
  const can3D = useCan3D();
  if (steps.length === 0) return null;
  return can3D ? <Desktop3D steps={steps} seedKey={seedKey} /> : <RouteList steps={steps} />;
}

function Desktop3D({ steps, seedKey }: { steps: ItineraryStep[]; seedKey: string }) {
  const t = useTranslations("timeline");
  const theme = useDocTheme();
  const listRef = useRef<HTMLOListElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  // Activation line sits just below the sticky stage.
  const { progress, active } = useStepProgress(listRef, steps.length, 0.72);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div data-testid="itinerary" data-mode="3d" className="relative">
      {/* Landscape stage pinned under the header; step cards scroll up beneath it. */}
      <div className="sticky top-20 z-10 -mx-1 bg-bg px-1 pt-4 pb-3">
        <div
          ref={stageRef}
          role="img"
          aria-label={t("label", { count: steps.length })}
          className="relative aspect-video min-h-[420px] w-full overflow-hidden rounded-2xl border hairline shadow-[0_18px_40px_-28px_var(--glow)]"
          style={{ background: "linear-gradient(to bottom, var(--bg) 0%, var(--bg-elev) 60%, var(--surface) 100%)" }}
        >
          {near ? (
            <ItineraryScene
              count={steps.length}
              seedKey={seedKey}
              progress={progress}
              active={active}
              theme={theme}
              stopLabel={(n) => t("stop", { n: String(n).padStart(2, "0") })}
            />
          ) : (
            <p className="readout absolute inset-0 grid place-items-center text-xs text-ink-faint">{t("loading")}</p>
          )}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-bg/80 to-transparent px-5 pt-4 pb-10">
            <p className="readout text-xs text-accent" aria-live="polite">
              {t("progress", { current: active + 1, total: steps.length })}
            </p>
            <div aria-hidden className="flex gap-1.5 pt-1">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-accent" : i < active ? "w-3 bg-accent/60" : "w-3 bg-line-strong"}`}
                />
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 via-bg/50 to-transparent px-5 pt-14 pb-4">
            <p className="readout text-[11px] text-accent">{t("stop", { n: String(active + 1).padStart(2, "0") })}</p>
            <p className="display mt-1 truncate text-xl">{steps[active].title}</p>
          </div>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-full h-10 bg-gradient-to-b from-bg to-transparent" />
      </div>

      <p className="eyebrow mt-5 mb-4">{t("hint")}</p>
      <ol ref={listRef} className="relative border-l hairline pl-8">
        {steps.map((step, i) => (
          <li
            key={i}
            aria-current={i === active ? "step" : undefined}
            data-active={i === active || undefined}
            className="relative flex min-h-[34vh] flex-col pb-6"
          >
            <span
              aria-hidden
              className={`absolute top-6 -left-[2.32rem] size-3 rounded-full ring-4 ring-bg transition-colors duration-500 ${
                i <= active ? "bg-accent" : "bg-line-strong"
              }`}
            />
            <div
              className={`card p-6 transition-[opacity,border-color] duration-500 ${
                i === active ? "border-accent/60 opacity-100" : i < active ? "opacity-90" : "opacity-80"
              }`}
            >
              <p className="readout text-xs text-accent">{t("stop", { n: String(i + 1).padStart(2, "0") })}</p>
              <h3 className="display mt-2 text-2xl">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RouteList({ steps }: { steps: ItineraryStep[] }) {
  const t = useTranslations("timeline");
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress, active } = useStepProgress(listRef, steps.length);
  return (
    <div data-testid="itinerary" data-mode="list" className="relative">
      <RouteRail progress={scrollYProgress} />
      <ol ref={listRef} className="space-y-10 pl-12">
        {steps.map((step, i) => (
          <li key={i} aria-current={i === active ? "step" : undefined} data-active={i === active || undefined} className="relative">
            <span
              className={`absolute -left-[2.45rem] top-1.5 grid size-4 place-items-center rounded-full bg-bg ring-1 transition-colors ${
                i <= active ? "ring-accent" : "ring-line-strong"
              }`}
            >
              <span className={`size-1.5 rounded-full ${i <= active ? "bg-accent" : "bg-ink-faint"}`} />
            </span>
            <p className="readout text-xs text-accent">{t("stop", { n: String(i + 1).padStart(2, "0") })}</p>
            <h3 className="display mt-2 text-2xl">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-ink-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Dashed road on the left; the travelled part fills in and the jeep rides the scroll position. */
function RouteRail({ progress }: { progress: MotionValue<number> }) {
  const top = useTransform(progress, [0, 1], ["0%", "100%"]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-8">
      <svg className="absolute inset-0 size-full" viewBox="0 0 32 100" preserveAspectRatio="none" fill="none">
        <path d="M16 0 V100" stroke="var(--line-strong)" strokeWidth={2} strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
        <motion.path
          d="M16 0 V100"
          stroke="var(--accent)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: progress }}
        />
      </svg>
      <motion.div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top }}>
        <span className="grid size-8 place-items-center rounded-full border border-accent/50 bg-bg text-accent shadow-[0_0_18px_var(--glow)]">
          <Jeep size={18} />
        </span>
      </motion.div>
    </div>
  );
}
