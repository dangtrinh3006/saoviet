// MapLibre v6 ships its web worker as a separate ESM file that bundlers don't emit;
// serve it from public/ and point maplibregl.setWorkerUrl at it.
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "public", "vendor");
mkdirSync(out, { recursive: true });
copyFileSync(join(root, "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs"), join(out, "maplibre-gl-worker.mjs"));
console.log("vendor: maplibre-gl-worker.mjs");
