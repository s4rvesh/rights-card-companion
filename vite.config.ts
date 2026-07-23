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
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/~oauth/],
          runtimeCaching: [],
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
