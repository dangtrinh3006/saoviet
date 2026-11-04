"use client";
/* eslint-disable react-hooks/immutability -- three.js objects are mutated per frame by design (R3F useFrame). */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useDocTheme, useMounted } from "@/lib/use-client";

const vertex = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // Atmospheric scintillation: each star flickers at its own phase and rate.
    vTwinkle = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed * 2.2) + aSeed * 40.0);
    vColor = aColor;
    gl_PointSize = aSize * uPixelRatio * (60.0 / -mv.z);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uTint;
  uniform float uMono;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = smoothstep(0.5, 0.0, d);
    float halo = exp(-d * 9.0) * 0.6;
    float alpha = (core * core + halo) * vTwinkle;
    vec3 color = mix(vColor, uTint, uMono);
    gl_FragColor = vec4(color, alpha);
  }
`;

// Star colour by rough spectral class: mostly white, some blue-white and warm giants.
function starColor(r: number): [number, number, number] {
  if (r < 0.12) return [0.66, 0.78, 1.0];
  if (r < 0.2) return [1.0, 0.82, 0.62];
  if (r < 0.24) return [1.0, 0.66, 0.5];
  return [1, 0.97, 0.94];
}

/** Seeded PRNG keeps the star layout pure and identical across renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Stars({ count, tint, mono }: { count: number; tint: string; mono: number }) {
  const ref = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const pointer = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    // Tilted band approximates the Milky Way: 45% of stars cluster near a great circle.
    const rand = mulberry32(20261104);
    const band = new THREE.Vector3(0.35, 1, 0.2).normalize();
    for (let i = 0; i < count; i++) {
      const r = 40 + rand() * 60;
      const z = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      let v = new THREE.Vector3(Math.sqrt(1 - z * z) * Math.cos(a), Math.sqrt(1 - z * z) * Math.sin(a), z);
      if (rand() < 0.45) {
        v = v.sub(band.clone().multiplyScalar(v.dot(band) * (0.85 + rand() * 0.15))).normalize();
      }
      positions.set([v.x * r, v.y * r, v.z * r], i * 3);
      const mag = Math.pow(rand(), 6);
      sizes[i] = 0.6 + mag * 5.5;
      seeds[i] = rand();
      colors.set(starColor(rand()), i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(gl.getPixelRatio(), 1.75) },
          uTint: { value: new THREE.Color("#ffffff") },
          uMono: { value: 0 },
        },
      }),
    [gl],
  );

  useEffect(() => {
    material.uniforms.uTint.value.set(tint);
    material.uniforms.uMono.value = mono;
    // Light theme draws stars as ink dots, which additive blending would erase.
    material.blending = mono > 0.9 && tint !== "#ff5a44" ? THREE.NormalBlending : THREE.AdditiveBlending;
    material.needsUpdate = true;
  }, [tint, mono, material]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (!ref.current) return;
    // Sidereal drift plus a little pointer parallax, eased so it never jerks.
    ref.current.rotation.y += delta * 0.012;
    ref.current.rotation.x += (pointer.current.y * 0.12 - ref.current.rotation.x) * 0.04;
    ref.current.rotation.z += (pointer.current.x * 0.08 - ref.current.rotation.z) * 0.04;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

const THEME_TINT: Record<string, { tint: string; mono: number }> = {
  light: { tint: "#2c2a7a", mono: 1 },
  red: { tint: "#ff5a44", mono: 1 },
  dark: { tint: "#ffffff", mono: 0 },
};

export function Starfield({ className }: { className?: string }) {
  const mounted = useMounted();
  const theme = useDocTheme();
  const env = useMemo(
    () =>
      mounted
        ? {
            count: window.matchMedia("(max-width: 768px)").matches ? 2200 : 6500,
            reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          }
        : null,
    [mounted],
  );
  if (!env) return <div className={className} />;
  const { tint, mono } = THEME_TINT[theme] ?? THEME_TINT.dark;

  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        frameloop={env.reduced ? "demand" : "always"}
      >
        <Stars count={env.count} tint={tint} mono={mono} />
      </Canvas>
    </div>
  );
}
