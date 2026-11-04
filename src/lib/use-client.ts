"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** true only after hydration; avoids setState-in-effect for client-only values. */
export const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

function subscribeTheme(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

/** The theme next-themes wrote on <html>, readable outside its React context (e.g. WebGL). */
export const useDocTheme = () =>
  useSyncExternalStore(subscribeTheme, () => document.documentElement.dataset.theme ?? "dark", () => "dark");
