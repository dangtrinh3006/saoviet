"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MLMap } from "maplibre-gl";
import { Layers, Mountain, Search, X } from "@/components/ui/icons";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { locations } from "@/content/locations";
import type { SkyLocation } from "@/content/types";
import { cn } from "@/lib/cn";
import { pick } from "@/lib/l10n";
import { useSky } from "@/lib/use-sky";
import { LocationPanel } from "./location-panel";

const STYLES = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  light: "https://tiles.openfreemap.org/styles/positron",
  red: "https://tiles.openfreemap.org/styles/dark",
} as const;

const NIGHT_LIGHTS =
  "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png";
const TERRAIN = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

const VIETNAM: [number, number] = [106.2, 16.2];

function toGeoJSON(list: SkyLocation[], locale: string): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: list.map((l) => ({
      type: "Feature",
      id: l.slug,
      properties: { slug: l.slug, name: pick(l.name, locale), sqm: l.sqm, bortle: l.bortle },
      geometry: { type: "Point", coordinates: [l.lng, l.lat] },
    })),
  };
}

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function SkyMap() {
  const t = useTranslations("map");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const params = useSearchParams();
  const sky = useSky();
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [selected, setSelected] = useState<SkyLocation | null>(null);
  const [query, setQuery] = useState("");
  const [nightLights, setNightLights] = useState(true);
  const [terrain, setTerrain] = useState(true);
  const [listOpen, setListOpen] = useState(false);
  const layersRef = useRef({ nightLights, terrain });
  useEffect(() => {
    layersRef.current = { nightLights, terrain };
  }, [nightLights, terrain]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? locations.filter((l) => `${l.name.vi} ${l.name.en} ${l.province.vi}`.toLowerCase().includes(q)) : locations;
    return [...list].sort((a, b) => b.sqm - a.sqm);
  }, [query]);

  const select = (l: SkyLocation | null, fly = true) => {
    setSelected(l);
    setListOpen(false);
    const map = mapRef.current;
    if (!map || !l || !fly) return;
    const mobile = window.innerWidth < 768;
    map.flyTo({
      center: [l.lng, l.lat],
      zoom: 10.5,
      pitch: 62,
      bearing: -20,
      duration: 2600,
      essential: true,
      // Keep the marker visible beside the panel (right on desktop, above sheet on mobile).
      padding: mobile ? { bottom: window.innerHeight * 0.5, top: 0, left: 0, right: 0 } : { right: 440, left: 0, top: 0, bottom: 0 },
    });
  };

  // Build the map once per theme: a style swap drops custom layers, so re-adding is simpler.
  useEffect(() => {
    if (!container.current) return;
    const theme = (resolvedTheme as keyof typeof STYLES) ?? "dark";
    maplibregl.setWorkerUrl("/vendor/maplibre-gl-worker.mjs");
    const map = new maplibregl.Map({
      container: container.current,
      style: STYLES[theme] ?? STYLES.dark,
      center: VIETNAM,
      zoom: 1.6,
      attributionControl: { compact: true },
      maxPitch: 75,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    map.on("style.load", () => {
      map.setProjection({ type: "globe" });
      const accent = cssVar("--accent") || "#f2b544";
      const ink = cssVar("--ink") || "#e9edf6";
      const bg = cssVar("--bg") || "#060a13";

      map.addSource("dem", { type: "raster-dem", tiles: [TERRAIN], tileSize: 256, encoding: "terrarium", maxzoom: 13, attribution: "Terrain: Mapzen / AWS Open Data" });
      map.addLayer({ id: "hillshade", type: "hillshade", source: "dem", paint: { "hillshade-exaggeration": theme === "light" ? 0.35 : 0.55, "hillshade-shadow-color": theme === "light" ? "#7d7464" : "#000000", "hillshade-highlight-color": theme === "light" ? "#ffffff" : "#334" } }, map.getStyle().layers?.find((l) => l.type === "symbol")?.id);
      if (layersRef.current.terrain) map.setTerrain({ source: "dem", exaggeration: 1.5 });

      map.addSource("night", { type: "raster", tiles: [NIGHT_LIGHTS], tileSize: 256, maxzoom: 8, attribution: "Night lights: NASA Black Marble 2016" });
      map.addLayer({ id: "night", type: "raster", source: "night", paint: { "raster-opacity": theme === "light" ? 0.45 : 0.75, "raster-saturation": theme === "red" ? -1 : 0 }, layout: { visibility: layersRef.current.nightLights ? "visible" : "none" } });

      map.addSource("sites", { type: "geojson", data: toGeoJSON(locations, locale) });
      map.addLayer({ id: "sites-halo", type: "circle", source: "sites", paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 10, 10, 26], "circle-color": accent, "circle-opacity": 0.16, "circle-blur": 0.9 } });
      map.addLayer({
        id: "sites-dot",
        type: "circle",
        source: "sites",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 4, 10, 9],
          "circle-color": accent,
          "circle-stroke-color": bg,
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "sites-label",
        type: "symbol",
        source: "sites",
        minzoom: 4.5,
        layout: { "text-field": ["get", "name"], "text-size": 12, "text-offset": [0, 1.4], "text-anchor": "top", "text-font": ["Noto Sans Regular"] },
        paint: { "text-color": ink, "text-halo-color": bg, "text-halo-width": 1.4 },
      });

      map.on("click", "sites-dot", (e) => {
        const slug = e.features?.[0]?.properties?.slug as string | undefined;
        const l = locations.find((x) => x.slug === slug);
        if (l) select(l);
      });
      map.on("mouseenter", "sites-dot", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "sites-dot", () => (map.getCanvas().style.cursor = ""));

      const initial = locations.find((l) => l.slug === params.get("l"));
      if (initial) setTimeout(() => select(initial), 600);
      else map.flyTo({ center: VIETNAM, zoom: window.innerWidth < 768 ? 4.3 : 5.1, duration: 3200, essential: true });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  useEffect(() => {
    const src = mapRef.current?.getSource("sites") as GeoJSONSource | undefined;
    src?.setData(toGeoJSON(locations, locale));
  }, [locale]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.getLayer("night")) map.setLayoutProperty("night", "visibility", nightLights ? "visible" : "none");
  }, [nightLights]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.getSource("dem")) map.setTerrain(terrain ? { source: "dem", exaggeration: 1.5 } : null);
  }, [terrain]);

  return (
    <div className="relative h-[100svh] w-full overflow-hidden pt-16 md:pt-20">
      {/* maplibre's own CSS sets the map element to position:relative, so size it via a wrapper. */}
      <div className="absolute inset-0 top-16 md:top-20">
        <div ref={container} className="size-full" aria-label={t("title")} />
      </div>

      {/* Search + list: left rail on desktop, collapsible drawer on mobile. */}
      <div className="pointer-events-none absolute left-3 right-3 top-20 z-10 md:left-6 md:right-auto md:top-28 md:w-80">
        <div className="card pointer-events-auto p-3">
          <div className="flex items-center gap-2">
            <Search size={16} className="ml-1 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setListOpen(true)}
              placeholder={t("filters")}
              className="w-full bg-transparent py-1.5 text-sm outline-none placeholder:text-ink-faint"
            />
            <button type="button" onClick={() => setListOpen((v) => !v)} className="readout rounded-full px-2 py-1 text-xs text-ink-muted ring-1 ring-line md:hidden">
              {filtered.length}
            </button>
          </div>
          <div className={cn("mt-2 max-h-[46vh] overflow-y-auto border-t hairline pt-2", listOpen ? "block" : "hidden md:block")}>
            {filtered.map((l) => (
              <button
                key={l.slug}
                type="button"
                onClick={() => select(l)}
                className={cn("flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-bg-elev", selected?.slug === l.slug && "bg-bg-elev")}
              >
                <span className="truncate">{pick(l.name, locale)}</span>
                <span className="readout shrink-0 text-xs text-ink-muted">{l.sqm.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card pointer-events-auto mt-3 hidden space-y-2 p-4 text-xs md:block">
          <p className="eyebrow">{t("legend")}</p>
          <div className="h-2 rounded-full" style={{ background: "linear-gradient(90deg,#000,#1b2a6b,#2f7d4f,#d6c64a,#e07b2a,#fff)" }} />
          <div className="readout flex justify-between text-ink-faint">
            <span>22.0</span>
            <span>SQM</span>
            <span>18.0</span>
          </div>
          <p className="leading-relaxed text-ink-faint">{t("estimateNote")}</p>
        </div>
      </div>

      <div className="absolute bottom-24 left-3 z-10 flex flex-col gap-2 md:bottom-8 md:left-6 md:flex-row">
        <button type="button" onClick={() => setNightLights((v) => !v)} aria-pressed={nightLights} className={cn("btn !px-4 !py-2.5 text-xs", nightLights ? "btn-primary" : "btn-ghost bg-bg/70 backdrop-blur")}>
          <Layers size={14} /> VIIRS
        </button>
        <button type="button" onClick={() => setTerrain((v) => !v)} aria-pressed={terrain} className={cn("btn !px-4 !py-2.5 text-xs", terrain ? "btn-primary" : "btn-ghost bg-bg/70 backdrop-blur")}>
          <Mountain size={14} /> 3D
        </button>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.aside
            key={selected.slug}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="card absolute inset-x-2 bottom-2 z-20 max-h-[58svh] overflow-y-auto md:inset-x-auto md:bottom-6 md:right-6 md:top-28 md:max-h-none md:w-[400px]"
          >
            <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-bg/70 ring-1 ring-line">
              <X size={16} />
            </button>
            <LocationPanel location={selected} sky={sky.data?.[selected.slug]} loading={sky.loading} />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
