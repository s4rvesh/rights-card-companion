# Rights Card — Proposed Structure

## Constraint flags (read first)

1. **Stack mismatch.** This project is scaffolded on **TanStack Start** (SSR-capable, server functions, `src/routes/` file-based routing), not plain "React + Vite". We can still ship a fully static, offline app from it — routes render as client components, no server functions, no loaders hitting the network — but the file layout below uses `src/routes/` (TanStack), not `src/pages/`. If you want a plain Vite + React Router SPA instead, say so and I'll re-scaffold.
2. **PWA / offline = a service worker.** "Works in airplane mode after first load" requires a service worker that precaches the built assets + bundled JSON. That is local code, not a network call at runtime, so it fits your rules — but it *is* a script the browser runs in the background. Confirm that's acceptable. Without it, a hard refresh with no network will fail even though all data is bundled.
3. **First load requires network.** The user has to load the site once online to install the PWA. After that, airplane mode is fine. Flagging so "never any network" is understood as "never at runtime after install".
4. **shadcn/ui is fine** — it's copy-pasted local components, no runtime third-party calls. Radix primitives it depends on are bundled.
5. **Fonts / icons.** Must be bundled locally (no Google Fonts CDN, no external icon CDN). Plan uses system font stack + `lucide-react` (bundled).
6. **`tel:` links for legal aid numbers** are not network requests from the web app — they hand off to the dialer. Allowed under your rules; calling me out if you disagree.
7. **Two localStorage keys only:** `rc.lang` (UI language) and `rc.card` (user's saved emergency card: name, blood group, emergency contact, known conditions). Confirm that's the intended shape.
8. **No analytics / error reporting.** The template ships a `lovable-error-reporting` hook in `__root.tsx`; I'll strip it so nothing phones home.

## File structure

```text
public/
  manifest.webmanifest              # name, icons, standalone, theme
  icons/                            # 192, 384, 512 png, maskable
  favicon.ico
src/
  routes/
    __root.tsx                      # shell, lang provider, nav, no error reporter
    index.tsx                       # Home: big buttons -> Rights / Aid / First Aid / My Card
    rights.tsx                      # Arrest rights checklist
    legal-aid.tsx                   # NALSA/SLSA numbers, tel: links, by state
    first-aid.tsx                   # Heat stroke + injury quick guides (index)
    first-aid.$topic.tsx            # Individual first-aid topic detail
    my-card.tsx                     # Edit/view personal emergency card
    settings.tsx                    # Language toggle, reset data, about
  components/
    AppShell.tsx                    # Header + bottom tab nav
    LanguageToggle.tsx
    BigActionButton.tsx             # Large tappable home tiles
    RightItem.tsx                   # Numbered right w/ plain-language + legal ref
    PhoneRow.tsx                    # Label + tel: link + copy button
    FirstAidStep.tsx                # Ordered step w/ icon
    WarningCallout.tsx              # "Call 112" style alert block
    EmergencyCard.tsx               # Renders saved rc.card (also print view)
    CardForm.tsx                    # Edit form for rc.card
    OfflineBadge.tsx                # Small "Offline ready" indicator
    ui/                             # shadcn primitives (button, input, etc.)
  data/
    rights.en.json
    rights.hi.json
    legal-aid.json                  # states -> [{label, phone}]
    first-aid.en.json
    first-aid.hi.json
    languages.json                  # supported langs metadata
  lib/
    storage.ts                      # typed get/set for rc.lang, rc.card only
    i18n.ts                         # tiny lookup: (lang, key) -> string, no libs
    types.ts                        # Right, AidNumber, FirstAidTopic, CardData
    validate.ts                     # zod-free hand validation for rc.card
  hooks/
    useLang.ts                      # reads/writes rc.lang
    useCard.ts                      # reads/writes rc.card
  styles.css                        # tailwind + tokens (already present)
  pwa/
    register-sw.ts                  # guarded registration (prod only, not in preview)
  sw.ts                             # precache app shell + JSON via vite-plugin-pwa
```

Files to remove/neutralize from template: `src/lib/lovable-error-reporting.ts` usage in `__root.tsx`, any server function examples, `src/server.ts` network paths (keep file, no handlers).

## Component inventory (what each does)

- **AppShell** — header w/ language toggle, bottom tab bar (Home, Rights, Aid, First Aid, Card).
- **BigActionButton** — 4 home tiles, high-contrast, thumb-sized.
- **RightItem** — one right: short plain-language line + expandable legal citation (from bundled JSON).
- **PhoneRow** — legal-aid entry: state/label, `tel:` link, copy-to-clipboard.
- **FirstAidStep** — numbered step with optional icon and "do not" variant.
- **WarningCallout** — red block for "call 112 immediately" triggers.
- **EmergencyCard** — read-only rendering of `rc.card`, print-friendly.
- **CardForm** — controlled form, writes to `rc.card`, no network.
- **LanguageToggle** — switches `rc.lang`, re-renders text from JSON.
- **OfflineBadge** — shows "Ready offline" once SW is active.

## Data shape (bundled JSON, no fetch)

- `rights.<lang>.json`: `[{ id, title, body, legalRef }]`
- `legal-aid.json`: `{ national: [...], states: { [state]: [{label, phone}] } }`
- `first-aid.<lang>.json`: `[{ id, title, when, steps: [{text, warn?: bool}], doNot: [] }]`

All imported statically so Vite bundles them into the JS — no runtime fetch.

## Open questions before I build

1. Confirm service worker (via `vite-plugin-pwa`) is acceptable for true offline.
2. Which languages? English + Hindi to start, or more (Tamil, Bengali, …)?
3. Is `lucide-react` (bundled icons) OK, or do you want zero icon library?
4. Confirm `rc.card` fields: name, blood group, emergency contact name+phone, allergies/conditions. Anything else?
5. OK to keep TanStack Start scaffold, or switch to plain Vite + React Router?
