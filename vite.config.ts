// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        strategies: "generateSW",
        injectRegister: null,
        devOptions: { enabled: false },
        workbox: {
          globPatterns: ["**/*.{js,css,html,woff2,json,png,svg}"],
          // The client build sits in a "client/" subdirectory, so workbox
          // generated precache URLs like "client/assets/app.js" — which 404
          // on the deployed site where assets are served from the root.
          // One failed entry fails the whole precache install, so before this
          // NOTHING was cached and the app was never really offline-capable.
          modifyURLPrefix: { "client/": "" },
          // This app is server-rendered, so the build emits NO html files —
          // a navigateFallback would point at something that never exists.
          // Instead each route's HTML is cached as it is fetched, and
          // src/pwa/warm.ts fetches them all on first load so nothing has to
          // be visited manually.
          navigateFallbackDenylist: [/^\/~oauth/],
          runtimeCaching: [
            {
              // Route documents. Matched by PATH, not by request.mode: the
              // warm-up in src/pwa/warm.ts uses an ordinary fetch (the spec
              // forbids constructing a fetch with mode:"navigate"), so a
              // mode-based rule would never catch it. Path matching means the
              // warm fetch and a real navigation share one cache entry.
              urlPattern: ({
                url,
                sameOrigin,
              }: {
                url: URL;
                sameOrigin: boolean;
              }) =>
                sameOrigin &&
                /^\/(rights|detained|medical|legal|before|card)?\/?$/.test(
                  url.pathname,
                ),
              handler: "NetworkFirst",
              options: {
                cacheName: "r2p-pages",
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 90 },
                cacheableResponse: { statuses: [200] },
                // The warm fetch and a browser navigation send different
                // Accept headers; without this a Vary:Accept response would
                // miss the cache exactly when it is needed.
                matchOptions: { ignoreVary: true },
              },
            },
          ],
          cleanupOutdatedCaches: true,
        },
        manifest: {
          id: "/",
          name: "Right2Protest",
          short_name: "Right2Protest",
          description:
            "Offline pocket reference for your rights on arrest, legal aid contacts, and emergency medical guidance in India.",
          display: "standalone",
          orientation: "portrait",
          lang: "en",
          dir: "ltr",
          scope: "/",
          categories: ["education", "reference", "utilities"],
          background_color: "#0D0D14",
          theme_color: "#FFE600",
          // The router uses real paths, not hash routing — "/#/" was a
          // leftover from the original spec and breaks TWA scope checks.
          start_url: "/",
          shortcuts: [
            {
              name: "My rights",
              short_name: "Rights",
              url: "/rights",
              icons: [{ src: "/icon-192.png", sizes: "192x192" }],
            },
            {
              name: "Medical",
              short_name: "Medical",
              url: "/medical",
              icons: [{ src: "/icon-192.png", sizes: "192x192" }],
            },
          ],
          icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "/icon-512-maskable.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
      }),
    ],
  },
});
