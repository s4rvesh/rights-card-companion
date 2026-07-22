import { useCallback, useEffect, useState } from "react";

/**
 * Language switch for the whole app.
 *
 * Persistence: exactly one localStorage key — "rc.lang" — per the app-wide
 * two-key rule (rc.lang, rc.card). Default is "en".
 *
 * SSR-safe: the initial render (both on the server and the first client
 * paint before hydration) always uses "en", then reads localStorage in an
 * effect. This avoids a hydration mismatch.
 *
 * `t(obj)` picks the `_en` / `_hi` field off any bilingual content object.
 * Components should never inline strings — call t() on typed content.
 */

export type Lang = "en" | "hi";

const STORAGE_KEY = "rc.lang";
const DEFAULT_LANG: Lang = "en";

function isLang(v: unknown): v is Lang {
  return v === "en" || v === "hi";
}

function readStoredLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isLang(raw) ? raw : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function useLang() {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Hydrate from localStorage after mount so SSR HTML matches first paint.
  useEffect(() => {
    const stored = readStoredLang();
    if (stored !== lang) setLangState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be blocked (private mode); language still works in-session.
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "en" ? "hi" : "en");
  }, [lang, setLang]);

  /**
   * Pick the localized field from a bilingual content object.
   * Given `{ title_en, title_hi, ... }` and no key argument, returns the
   * first `_en` / `_hi` pair found. Pass a key to pick a specific field
   * from an object that carries several (e.g. `t(card, "condition")`).
   */
  function t<K extends string>(obj: Record<string, unknown>, key?: K): string {
    if (key) {
      const v = obj[`${key}_${lang}`];
      return typeof v === "string" ? v : "";
    }
    for (const k of Object.keys(obj)) {
      if (k.endsWith(`_${lang}`)) {
        const v = obj[k];
        if (typeof v === "string") return v;
      }
    }
    return "";
  }

  return { lang, setLang, toggle, t };
}