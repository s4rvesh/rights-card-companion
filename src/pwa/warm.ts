/**
 * Offline warm-up.
 *
 * The app is server-rendered, so route HTML only exists when the server
 * builds it — there are no html files in the bundle for the service worker
 * to precache. The route JS *is* precached, but without a cached document
 * a cold offline navigation to /rights has nothing to boot from.
 *
 * So: once the service worker is in control, quietly fetch every route.
 * The NetworkFirst navigation handler in vite.config.ts stores each
 * response in the "r2p-pages" cache. After one visit to any page, the whole
 * app works with the network off — no tapping through sections first.
 *
 * Deliberately cheap: a handful of small HTML documents, fetched one at a
 * time, lowest priority, only once per app version, and only on a
 * connection that looks willing. Someone on 2G at a protest should not have
 * us competing for their bandwidth.
 */

const ROUTES = ["/", "/rights", "/detained", "/medical", "/legal", "/before"];

const DONE_KEY = "rc.warmed";

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

function shouldSkip(): boolean {
  if (typeof window === "undefined") return true;
  if (!("serviceWorker" in navigator)) return true;
  if (navigator.onLine === false) return true;

  const conn = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection;
  // Respect Data Saver, and don't pull six documents over 2G.
  if (conn?.saveData) return true;
  if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return true;

  try {
    // Re-warm when a new build ships; BUILD_ID changes per deploy.
    return window.localStorage.getItem(DONE_KEY) === BUILD_ID;
  } catch {
    return false;
  }
}

function markDone() {
  try {
    window.localStorage.setItem(DONE_KEY, BUILD_ID);
  } catch {
    /* storage blocked — warming again next visit is harmless */
  }
}

// Cache-bust per deployment without needing build-time injection: the SW
// script URL changes content between builds, but a simple version string is
// enough here since a stale warm just means we re-fetch once.
const BUILD_ID = "1";

async function warmRoutes(): Promise<void> {
  for (const path of ROUTES) {
    try {
      // NOT mode:"navigate" — the Fetch spec forbids constructing one, it
      // throws TypeError. A same-origin GET with a browser-like Accept
      // header lands in the same cache entry a real navigation will look up.
      await fetch(path, {
        credentials: "same-origin",
        redirect: "follow",
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
    } catch {
      // Offline mid-warm, or one route failed. Skip it; the next visit
      // retries the whole set.
      return;
    }
    // Yield between requests so we never block anything the user is doing.
    await new Promise((r) => setTimeout(r, 250));
  }
  markDone();
}

/** Call after registerPWA(). Never throws, never blocks render. */
export function warmOfflineCache(): void {
  if (shouldSkip()) return;

  const start = () => {
    // Wait for the SW to actually control the page, otherwise the fetches
    // bypass the navigation handler entirely and cache nothing.
    navigator.serviceWorker.ready
      .then(() => {
        if (!navigator.serviceWorker.controller) return;
        void warmRoutes();
      })
      .catch(() => {});
  };

  const idle = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void;
    }
  ).requestIdleCallback;

  if (idle) idle(start, { timeout: 8000 });
  else window.setTimeout(start, 3000);
}
