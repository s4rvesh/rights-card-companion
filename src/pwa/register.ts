// Guarded PWA registration wrapper. Per PWA skill: never register in dev,
// iframes, or Lovable preview/dev hosts. Kill-switch via ?sw=off.

import { warmOfflineCache } from "./warm";

const SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterMatching(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs
      .filter((r) => (r.active?.scriptURL || "").endsWith(SW_URL))
      .map((r) => r.unregister()),
  );
}

export type PwaEvent = "offline-ready" | "needs-refresh";
type Listener = (e: PwaEvent) => void;
const listeners = new Set<Listener>();

export function onPwaEvent(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(e: PwaEvent) {
  for (const fn of listeners) fn(e);
}

let started = false;

export async function registerPWA(): Promise<void> {
  if (started) return;
  started = true;

  if (isRefusedContext()) {
    await unregisterMatching().catch(() => {});
    return;
  }
  if (!("serviceWorker" in navigator)) return;

  const { registerSW } = await import("virtual:pwa-register");
  registerSW({
    immediate: true,
    onOfflineReady() {
      emit("offline-ready");
    },
    onNeedRefresh() {
      emit("needs-refresh");
    },
  });

  // Pull every route into the cache in the background so the app works
  // offline after a single visit, without the user opening each section.
  warmOfflineCache();
}
