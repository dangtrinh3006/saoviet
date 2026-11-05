import Image from "next/image";
import type { ImageRef } from "@/content/types";
import { isOptimizableImage } from "@/lib/catalog-schema";
import { cn } from "@/lib/cn";

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Deterministic star field + horizon silhouette, used when no licensed photo exists yet. */
function Generative({ seed }: { seed: string }) {
  const r = rng(seed);
  const stars = Array.from({ length: 140 }, () => ({ x: r() * 400, y: r() * 230, s: Math.pow(r(), 5) * 1.8 + 0.25 }));
  const hue = Math.floor(r() * 50) + 205;
  const ridge = Array.from({ length: 9 }, (_, i) => `${i * 50},${190 + r() * 45}`).join(" L");
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <linearGradient id={`g-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 55% 7%)`} />
          <stop offset="0.7" stopColor={`hsl(${hue + 10} 45% 16%)`} />
          <stop offset="1" stopColor={`hsl(${hue - 170} 60% 30%)`} />
        </linearGradient>
        <radialGradient id={`m-${seed}`} cx="0.6" cy="0.35" r="0.6">
          <stop offset="0" stopColor="hsl(220 60% 80% / 0.18)" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#g-${seed})`} />
      <ellipse cx="240" cy="110" rx="260" ry="46" transform="rotate(-24 240 110)" fill={`url(#m-${seed})`} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={0.4 + s.s / 3} />
      ))}
      <path d={`M0,300 L${ridge} L400,300 Z`} fill="hsl(225 40% 4%)" />
    </svg>
  );
}

export function SkyPlate({
  image,
  seed,
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority,
  credit = true,
}: {
  image?: ImageRef;
  seed: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  credit?: boolean;
}) {
  const usable = image && image.license !== "TBD" && image.src;
  return (
    <div className={cn("relative overflow-hidden bg-bg-elev", className)}>
      {usable ? (
        <>
          {isOptimizableImage(image.src) ? (
            <Image src={image.src} alt={image.alt.vi} fill sizes={sizes} priority={priority} className="object-cover" />
          ) : (
            // Admin-supplied image on an arbitrary host: next/image would reject it.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.src} alt={image.alt.vi} loading={priority ? "eager" : "lazy"} className="absolute inset-0 size-full object-cover" />
          )}
          {credit && (
            <a
              href={image.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="readout absolute bottom-2 right-2 z-10 max-w-[70%] truncate rounded bg-black/45 px-1.5 py-0.5 text-[9px] text-white/80 backdrop-blur hover:text-white"
            >
              © {image.credit} · {image.license}
            </a>
          )}
        </>
      ) : (
        <Generative seed={seed} />
      )}
    </div>
  );
}
