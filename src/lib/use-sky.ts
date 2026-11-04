"use client";

import { useEffect, useState } from "react";
import type { SkyConditions } from "./sky";

type SkyPayload = { updatedAt: string | null; data: Record<string, SkyConditions> };

// Module-level promise: every component on the page shares one request.
let inflight: Promise<SkyPayload> | null = null;

export function useSky() {
  const [state, setState] = useState<{ data: SkyPayload["data"] | null; updatedAt: string | null; loading: boolean }>({
    data: null,
    updatedAt: null,
    loading: true,
  });

  useEffect(() => {
    let alive = true;
    inflight ??= fetch("/api/sky")
      .then((r) => r.json() as Promise<SkyPayload>)
      .catch(() => ({ updatedAt: null, data: {} }));
    inflight.then((p) => alive && setState({ data: p.data, updatedAt: p.updatedAt, loading: false }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
