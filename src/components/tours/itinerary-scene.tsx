"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Palette = {
  fog: string;
  low: string;
  mid: string;
  high: string;
  accent: string;
  star: string;
  starAdditive: boolean;
  body: string;
  headlight: string;
  hemiSky: string;
  moon: string;
};

const PALETTES: Record<string, Palette> = {
  dark: {
    fog: "#060816", low: "#0a0f24", mid: "#1a2150", high: "#3a3f86", accent: "#7dffc4", star: "#ffffff",
    starAdditive: true, body: "#d8d2bd", headlight: "#ffe7b0", hemiSky: "#8b7bff", moon: "#b9c4ff",
  },
  light: {
    fog: "#e3e8f3", low: "#c3cae2", mid: "#959ec9", high: "#646ca0", accent: "#4b3df5", star: "#2c2a7a",
    starAdditive: false, body: "#f4efe2", headlight: "#fff1c4", hemiSky: "#ffffff", moon: "#ffffff",
  },
  red: {
    fog: "#0c0101", low: "#160202", mid: "#2c0504", high: "#4c0b07", accent: "#ff6a4d", star: "#ff5a44",
    starAdditive: true, body: "#6a1a10", headlight: "#ff5a44", hemiSky: "#ff3b2a", moon: "#ff6a4d",
  },
};

/** Seeded PRNG keeps the landscape pure and identical across renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** 2D value noise with fractal octaves; lattice values come from the seeded PRNG. */
function makeFbm(rand: () => number) {
  const perm = new Uint8Array(512);
  const vals = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    perm[i] = i;
    vals[i] = rand();
  }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const lattice = (x: number, y: number) => vals[perm[(x & 255) + perm[y & 255]]];
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    const a = lattice(xi, yi);
    const b = lattice(xi + 1, yi);
    const c = lattice(xi, yi + 1);
    const d = lattice(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  return (x: number, y: number) => {
    let sum = 0;
    let amp = 0.5;
    let freq = 1;
    for (let o = 0; o < 4; o++) {
      sum += amp * noise(x * freq, y * freq);
      freq *= 2.03;
      amp *= 0.5;
    }
    return sum / 0.9375;
  };
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const SPAN = 46;
const TUBE_SEGMENTS = 400;
const TUBE_RADIAL = 6;

type World = {
  terrain: THREE.BufferGeometry;
  faceHeights: Float32Array;
  maxHeight: number;
  curve: THREE.CatmullRomCurve3;
  pins: THREE.Vector3[];
  pinU: number[];
  roadDim: THREE.TubeGeometry;
  roadLit: THREE.TubeGeometry;
  stars: THREE.BufferGeometry;
  brightStars: THREE.BufferGeometry;
};

function buildWorld(count: number, seedKey: string): World {
  const rand = mulberry32(hashString(seedKey));
  const fbm = makeFbm(rand);
  const phase = rand() * Math.PI * 2;
  const ground = (x: number, z: number) => (fbm(x * 0.18 + 40, z * 0.18 + 40) - 0.5) * 0.5;

  // Pins spread along x with a seeded sideways wiggle; lead-in/out points keep the curve open.
  const n = Math.max(1, count);
  const pinsXZ: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? 0 : -SPAN / 2 + (SPAN * i) / (n - 1);
    pinsXZ.push([x, Math.sin(i * 1.9 + phase) * 3.2]);
  }
  const ctrl: [number, number][] = [[pinsXZ[0][0] - 5, pinsXZ[0][1] - 1.5]];
  for (let i = 0; i < n; i++) {
    ctrl.push(pinsXZ[i]);
    if (i < n - 1) {
      const [x0, z0] = pinsXZ[i];
      const [x1, z1] = pinsXZ[i + 1];
      ctrl.push([(x0 + x1) / 2, (z0 + z1) / 2 + (rand() - 0.5) * 5]);
    }
  }
  ctrl.push([pinsXZ[n - 1][0] + 5, pinsXZ[n - 1][1] + 1.5]);

  const flat = new THREE.CatmullRomCurve3(ctrl.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "catmullrom", 0.5);
  const samples = flat.getSpacedPoints(240);
  const distToRoute = (x: number, z: number) => {
    let best = Infinity;
    for (const p of samples) {
      const d = (p.x - x) ** 2 + (p.z - z) ** 2;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  };
  const routeZ = (x: number) => {
    let best = samples[0];
    for (const p of samples) if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p;
    return best.z;
  };

  // Valley along the road; tall ridges behind it (negative z), soft hills toward the camera.
  const height = (x: number, z: number) => {
    const d = distToRoute(x, z);
    const behind = z < routeZ(x);
    const peak = behind ? 1 + smoothstep(2, 14, d) * 7.5 : 0.4 + smoothstep(2, 8, d) * 0.9;
    const ridge = Math.pow(fbm(x * 0.09, z * 0.09), 1.6) * peak;
    return ground(x, z) + ridge * smoothstep(1.1, 4.5, d);
  };

  const plane = new THREE.PlaneGeometry(80, 34, 140, 60);
  plane.rotateX(-Math.PI / 2);
  plane.translate(0, 0, -5);
  const terrain = plane.toNonIndexed();
  plane.dispose();
  const pos = terrain.attributes.position as THREE.BufferAttribute;
  let maxHeight = 0;
  for (let i = 0; i < pos.count; i++) {
    const y = height(pos.getX(i), pos.getZ(i));
    pos.setY(i, y);
    if (y > maxHeight) maxHeight = y;
  }
  const faceHeights = new Float32Array(pos.count / 3);
  for (let f = 0; f < faceHeights.length; f++) {
    faceHeights[f] = (pos.getY(f * 3) + pos.getY(f * 3 + 1) + pos.getY(f * 3 + 2)) / 3;
  }
  terrain.setAttribute("color", new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3));
  terrain.computeVertexNormals();

  const lift = 0.06;
  const curve = new THREE.CatmullRomCurve3(
    flat.getSpacedPoints(160).map((p) => new THREE.Vector3(p.x, ground(p.x, p.z) + lift, p.z)),
    false,
    "centripetal",
  );
  const pins = pinsXZ.map(([x, z]) => new THREE.Vector3(x, ground(x, z) + lift, z));
  // Arc-length parameter of each pin, so the vehicle stops exactly on it.
  const dense = curve.getSpacedPoints(1200);
  const pinU = pins.map((p) => {
    let bi = 0;
    let bd = Infinity;
    dense.forEach((q, i) => {
      const d = q.distanceToSquared(p);
      if (d < bd) {
        bd = d;
        bi = i;
      }
    });
    return bi / (dense.length - 1);
  });

  const roadDim = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, 0.05, TUBE_RADIAL, false);
  const roadLit = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, 0.07, TUBE_RADIAL, false);

  const dome = (total: number, rMin: number) => {
    const arr = new Float32Array(total * 3);
    for (let i = 0; i < total; i++) {
      const az = rand() * Math.PI * 2;
      const el = Math.asin(0.06 + rand() * 0.94);
      const r = rMin + rand() * 20;
      arr.set([Math.cos(el) * Math.cos(az) * r, Math.sin(el) * r + 2, Math.cos(el) * Math.sin(az) * r - 20], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  };

  return {
    terrain, faceHeights, maxHeight, curve, pins, pinU, roadDim, roadLit,
    stars: dome(2800, 70), brightStars: dome(220, 66),
  };
}

function paintTerrain(world: World, palette: Palette) {
  const low = new THREE.Color(palette.low);
  const mid = new THREE.Color(palette.mid);
  const high = new THREE.Color(palette.high);
  const c = new THREE.Color();
  const attr = world.terrain.attributes.color as THREE.BufferAttribute;
  const top = Math.max(1, world.maxHeight);
  for (let f = 0; f < world.faceHeights.length; f++) {
    // One colour per face keeps the faceted low-poly read.
    const h = Math.max(0, world.faceHeights[f]) / top;
    if (h < 0.35) c.copy(low).lerp(mid, h / 0.35);
    else c.copy(mid).lerp(high, (h - 0.35) / 0.65);
    for (let k = 0; k < 3; k++) attr.setXYZ(f * 3 + k, c.r, c.g, c.b);
  }
  attr.needsUpdate = true;
}

/** Maps a fractional step index (0..n-1) to the curve's arc-length parameter. */
function stepToU(pinU: number[], a: number) {
  if (pinU.length === 1) return pinU[0];
  const i = Math.min(pinU.length - 2, Math.max(0, Math.floor(a)));
  const t = Math.min(1, Math.max(0, a - i));
  return pinU[i] + (pinU[i + 1] - pinU[i]) * t;
}

function Vehicle({ palette, vehicleRef }: { palette: Palette; vehicleRef: RefObject<THREE.Group | null> }) {
  const wheels: [number, number][] = [[0.27, 0.3], [-0.27, 0.3], [0.27, -0.3], [-0.27, -0.3]];
  return (
    <group ref={vehicleRef}>
      <group scale={0.9}>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.5, 0.26, 0.98]} />
          <meshStandardMaterial color={palette.body} flatShading roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.56, -0.1]}>
          <boxGeometry args={[0.46, 0.24, 0.52]} />
          <meshStandardMaterial color={palette.body} flatShading roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.57, 0.165]}>
          <boxGeometry args={[0.42, 0.18, 0.02]} />
          <meshStandardMaterial color="#10142a" roughness={0.2} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.7, -0.1]}>
          <boxGeometry args={[0.5, 0.03, 0.56]} />
          <meshStandardMaterial color="#1b1f33" />
        </mesh>
        {wheels.map(([x, z], i) => (
          <mesh key={i} position={[x, 0.14, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.1, 10]} />
            <meshStandardMaterial color="#14161f" flatShading />
          </mesh>
        ))}
        <mesh position={[0, 0.36, -0.53]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 10]} />
          <meshStandardMaterial color="#14161f" flatShading />
        </mesh>
        {[0.16, -0.16].map((x) => (
          <group key={x}>
            <mesh position={[x, 0.36, 0.495]}>
              <boxGeometry args={[0.09, 0.06, 0.02]} />
              <meshStandardMaterial color={palette.headlight} emissive={palette.headlight} emissiveIntensity={3} toneMapped={false} />
            </mesh>
            <mesh position={[x * 1.2, 0.34, -0.495]}>
              <boxGeometry args={[0.06, 0.05, 0.02]} />
              <meshStandardMaterial color="#ff3344" emissive="#ff2233" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          </group>
        ))}
        <pointLight position={[0, 0.4, 1.1]} color={palette.headlight} intensity={5} distance={5} decay={2} />
      </group>
    </group>
  );
}

function Pin({ position, index, state, palette, label }: {
  position: THREE.Vector3;
  index: number;
  state: "past" | "active" | "future";
  palette: Palette;
  label: string;
}) {
  const glow = state === "active" ? 4 : state === "past" ? 1.6 : 0.5;
  const scale = state === "active" ? 1.35 : 1;
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.2, 6]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={state === "future" ? 0.35 : 0.8} />
      </mesh>
      <mesh position={[0, 1.25, 0]} scale={scale}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={glow} toneMapped={false} flatShading />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.28, 0.36, 24]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={state === "future" ? 0.25 : 0.7} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[0, 1.75, 0]} center zIndexRange={[10, 0]} className="pointer-events-none select-none">
        <span
          aria-label={label}
          className={`readout block rounded-full border px-2 py-0.5 text-[11px] whitespace-nowrap transition-colors ${
            state === "active" ? "border-accent bg-accent text-accent-ink" : "border-line-strong bg-bg/70 text-ink-muted"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </Html>
    </group>
  );
}

const CAM_OFFSET = new THREE.Vector3(0.6, 2.5, 6.4);

function Landscape({ count, seedKey, progress, active, palette, stopLabel }: {
  count: number;
  seedKey: string;
  progress: MotionValue<number>;
  active: number;
  palette: Palette;
  stopLabel: (n: number) => string;
}) {
  const world = useMemo(() => buildWorld(count, seedKey), [count, seedKey]);
  const invalidate = useThree((s) => s.invalidate);
  const vehicle = useRef<THREE.Group>(null);
  const skyRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const motion = useRef({ u: -1, look: new THREE.Vector3(), primed: false });

  useEffect(() => {
    paintTerrain(world, palette);
    invalidate();
  }, [world, palette, invalidate]);

  useEffect(() => progress.on("change", () => invalidate()), [progress, invalidate]);

  useEffect(
    () => () => {
      for (const g of [world.terrain, world.roadDim, world.roadLit, world.stars, world.brightStars]) g.dispose();
    },
    [world],
  );

  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), tan: new THREE.Vector3(), cam: new THREE.Vector3(), look: new THREE.Vector3() }), []);

  useFrame((state, rawDelta) => {
    const m = motion.current;
    const target = stepToU(world.pinU, progress.get());
    // Demand mode: delta can span an idle gap, so clamp before easing.
    const k = 1 - Math.exp(-Math.min(rawDelta, 1 / 30) * 5);
    m.u = m.primed ? m.u + (target - m.u) * k : target;

    world.curve.getPointAt(m.u, tmp.pos);
    world.curve.getTangentAt(m.u, tmp.tan);
    if (vehicle.current) {
      vehicle.current.position.copy(tmp.pos);
      vehicle.current.lookAt(tmp.look.copy(tmp.pos).add(tmp.tan));
    }
    world.roadLit.setDrawRange(0, Math.floor(m.u * TUBE_SEGMENTS) * TUBE_RADIAL * 6);

    tmp.cam.copy(tmp.pos).add(CAM_OFFSET);
    tmp.look.set(tmp.pos.x + tmp.tan.x * 1.5, tmp.pos.y + 0.6, tmp.pos.z - 1.2);
    if (m.primed) {
      state.camera.position.lerp(tmp.cam, k);
      m.look.lerp(tmp.look, k);
    } else {
      state.camera.position.copy(tmp.cam);
      m.look.copy(tmp.look);
      m.primed = true;
    }
    state.camera.lookAt(m.look);
    if (skyRef.current) skyRef.current.position.x = state.camera.position.x * 0.85;
    if (lightRef.current) {
      lightRef.current.position.copy(world.pins[Math.min(active, world.pins.length - 1)]);
      lightRef.current.position.y += 1.4;
    }

    if (Math.abs(target - m.u) > 1e-4 || state.camera.position.distanceToSquared(tmp.cam) > 1e-5) invalidate();
  });

  return (
    <>
      <fog attach="fog" args={[palette.fog, 14, 48]} />
      <hemisphereLight args={[palette.hemiSky, palette.low, palette.starAdditive ? 0.55 : 1.2]} />
      <directionalLight position={[-12, 18, -10]} intensity={palette.starAdditive ? 0.9 : 1.6} color={palette.moon} />
      <pointLight ref={lightRef} color={palette.accent} intensity={6} distance={6} decay={2} />

      <group ref={skyRef}>
        <points geometry={world.stars}>
          <pointsMaterial
            color={palette.star}
            size={1.4}
            sizeAttenuation={false}
            transparent
            opacity={palette.starAdditive ? 0.7 : 0.45}
            depthWrite={false}
            fog={false}
            blending={palette.starAdditive ? THREE.AdditiveBlending : THREE.NormalBlending}
          />
        </points>
        <points geometry={world.brightStars}>
          <pointsMaterial color={palette.star} size={2.6} sizeAttenuation={false} transparent opacity={0.9} depthWrite={false} fog={false} />
        </points>
      </group>

      <mesh geometry={world.terrain}>
        <meshStandardMaterial vertexColors flatShading roughness={1} metalness={0} />
      </mesh>
      <mesh geometry={world.roadDim}>
        <meshBasicMaterial color={palette.accent} transparent opacity={0.22} />
      </mesh>
      <mesh geometry={world.roadLit}>
        <meshBasicMaterial color={palette.accent} toneMapped={false} />
      </mesh>

      {world.pins.slice(0, count).map((p, i) => (
        <Pin
          key={i}
          position={p}
          index={i}
          palette={palette}
          label={stopLabel(i + 1)}
          state={i < active ? "past" : i === active ? "active" : "future"}
        />
      ))}
      <Vehicle palette={palette} vehicleRef={vehicle} />
    </>
  );
}

export default function ItineraryScene(props: {
  count: number;
  seedKey: string;
  progress: MotionValue<number>;
  active: number;
  theme: string;
  stopLabel: (n: number) => string;
}) {
  const palette = PALETTES[props.theme] ?? PALETTES.dark;
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop="demand"
      camera={{ position: [0, 3, 8], fov: 42, near: 0.1, far: 160 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Landscape {...props} palette={palette} />
    </Canvas>
  );
}
