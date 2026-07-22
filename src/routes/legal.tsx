import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import legalAid from "@/content/legalaid.json";
import copy from "@/content/legal.json";
import meta from "@/content/meta.json";
import { useLang } from "@/i18n/useLang";
import type { LegalAidContact } from "@/content/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/legal")({
  component: LegalScreen,
  head: () => ({
    meta: [
      { title: "Legal Aid — Rights Card" },
      {
        name: "description",
        content:
          "Free legal aid phone numbers, grouped by national services and state.",
      },
      { property: "og:title", content: "Legal Aid — Rights Card" },
      {
        property: "og:description",
        content:
          "Free legal aid phone numbers, grouped by national services and state.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const STATE_KEY = "rc.state";
const UNSELECTED = "__all__";

function readStoredState(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(STATE_KEY) ?? "";
  } catch {
    return "";
  }
}

function PhoneGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <path d="M4 5c0 9 6 15 15 15l2-4-5-2-2 2c-2-1-4-3-5-5l2-2-2-5-5 1z" />
    </svg>
  );
}

function Row({ entry, lang, t }: { entry: LegalAidContact; lang: string; t: (o: Record<string, unknown>, k?: string) => string }) {
  void lang;
  const name = t(entry, "name");
  return (
    <a
      href={`tel:${entry.phone}`}
      className="flex h-[72px] w-full items-center justify-between border-b border-steel/40 px-4 text-ink"
    >
      <div className="min-w-0 flex-1 pr-4">
        <div className="truncate font-sans text-[18px] font-semibold text-ink">
          {name}
        </div>
        <div className="truncate font-mono text-[16px] text-steel">
          {entry.phone}
        </div>
      </div>
      <PhoneGlyph />
    </a>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-ink bg-paper px-4 py-3 font-sans text-[12px] font-bold uppercase tracking-wider text-ink">
      {children}
    </h2>
  );
}

function LegalScreen() {
  const { lang, t } = useLang();
  const [selectedState, setSelectedState] = useState<string>("");

  useEffect(() => {
    setSelectedState(readStoredState());
  }, []);

  const entries = legalAid as LegalAidContact[];

  const { national, allStateScopes, forSelected, otherStates } = useMemo(() => {
    const national = entries.filter((e) => e.scope === "national");
    const stateEntries = entries.filter((e) => e.scope !== "national");
    const scopes = Array.from(new Set(stateEntries.map((e) => e.scope))).sort();
    const forSelected = selectedState
      ? stateEntries.filter((e) => e.scope === selectedState)
      : [];
    const otherStates = selectedState
      ? stateEntries.filter((e) => e.scope !== selectedState)
      : stateEntries;
    return {
      national,
      allStateScopes: scopes,
      forSelected,
      otherStates,
    };
  }, [entries, selectedState]);

  function onSelect(v: string) {
    const next = v === UNSELECTED ? "" : v;
    setSelectedState(next);
    try {
      if (next) window.localStorage.setItem(STATE_KEY, next);
      else window.localStorage.removeItem(STATE_KEY);
    } catch {
      // storage blocked; selection still applies for the session
    }
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex max-w-2xl flex-col">
        <div className="flex items-center justify-between px-4 pt-4">
          <Link
            to="/"
            className="font-sans text-[14px] font-medium uppercase tracking-wide text-steel"
          >
            ← {lang === "hi" ? "होम" : "HOME"}
          </Link>
        </div>

        <div className="px-4 pt-4">
          <Select
            value={selectedState || UNSELECTED}
            onValueChange={onSelect}
          >
            <SelectTrigger className="h-[56px] w-full rounded-none border-2 border-ink bg-paper px-4 font-sans text-[16px] text-ink">
              <SelectValue placeholder={t(copy, "select_state")} />
            </SelectTrigger>
            <SelectContent className="rounded-none border-2 border-ink bg-paper">
              <SelectItem value={UNSELECTED} className="h-[56px] font-sans text-[16px]">
                {t(copy, "all_states")}
              </SelectItem>
              {allStateScopes.map((s) => (
                <SelectItem key={s} value={s} className="h-[56px] font-sans text-[16px]">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="px-4 py-6 font-sans text-[16px] leading-snug text-ink">
          {t(copy, "banner")}
        </p>

        {entries.length === 0 && (
          <div className="flex min-h-[50vh] items-center justify-center px-6">
            <p className="text-center font-sans text-[16px] leading-snug text-steel">
              {t(meta, "empty_legal")}
            </p>
          </div>
        )}

        {national.length > 0 && (
          <section>
            <SectionHeading>{t(copy, "national")}</SectionHeading>
            {national.map((e, i) => (
              <Row key={`n-${i}`} entry={e} lang={lang} t={t} />
            ))}
          </section>
        )}

        {selectedState && forSelected.length > 0 && (
          <section>
            <SectionHeading>
              {t(copy, "your_state")} — {selectedState}
            </SectionHeading>
            {forSelected.map((e, i) => (
              <Row key={`s-${i}`} entry={e} lang={lang} t={t} />
            ))}
          </section>
        )}

        {otherStates.length > 0 && (
          <details className="group">
            <summary className="flex h-[56px] cursor-pointer list-none items-center justify-between border-b border-ink bg-paper px-4 font-sans text-[12px] font-bold uppercase tracking-wider text-ink [&::-webkit-details-marker]:hidden">
              <span>{t(copy, "other_states")}</span>
              <span className="font-mono text-steel group-open:hidden">+</span>
              <span className="hidden font-mono text-steel group-open:inline">−</span>
            </summary>
            {otherStates.map((e, i) => (
              <Row key={`o-${i}`} entry={e} lang={lang} t={t} />
            ))}
          </details>
        )}
      </div>
    </div>
  );
}