import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import legalAid from "@/content/legalaid.json";
import copy from "@/content/legal.json";
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5c0 9 6 15 15 15l2-4-5-2-2 2c-2-1-4-3-5-5l2-2-2-5-5 1z" />
    </svg>
  );
}

function MailGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M4 7.5l8 5 8-5" />
    </svg>
  );
}

function Row({
  entry,
  t,
}: {
  entry: LegalAidContact;
  t: (o: Record<string, unknown>, k?: string) => string;
}) {
  return (
    <a
      href={`tel:${entry.phone}`}
      className="pressable card-shadow flex w-full items-center justify-between rounded-card bg-paper px-4 py-4 text-ink"
    >
      <div className="min-w-0 flex-1 pr-4">
        <div className="truncate font-sans text-[17px] font-semibold text-ink">
          {t(entry, "name")}
        </div>
        <div className="truncate font-mono text-[15px] text-steel">
          {entry.phone}
        </div>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-alert/10 text-alert">
        <PhoneGlyph />
      </span>
    </a>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-4 pb-2 pt-6 font-mono text-[12px] font-bold uppercase tracking-wider text-steel">
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
  const isEmpty = entries.length === 0;
  const email = (copy as { email: string }).email;

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
    return { national, allStateScopes: scopes, forSelected, otherStates };
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
    <div className="min-h-dvh bg-canvas text-ink">
      <div className="mx-auto flex max-w-2xl flex-col">
        <div className="flex items-center justify-between px-4 pt-4">
          <Link
            to="/"
            className="font-sans text-[14px] font-medium uppercase tracking-wide text-steel"
          >
            ← {lang === "hi" ? "होम" : "HOME"}
          </Link>
        </div>

        <h1 className="px-4 pb-2 pt-4 font-display text-[28px] font-extrabold uppercase text-ink">
          {lang === "hi" ? "कानूनी मदद" : "Legal help"}
        </h1>

        {isEmpty ? (
          <div className="flex flex-col gap-3 px-4 pt-3">
            {/* Article 39A still applies even with no numbers listed yet. */}
            <div className="card-shadow rounded-card bg-paper px-5 py-5">
              <p className="font-sans text-[16px] font-medium leading-snug text-ink">
                {t(copy, "banner")}
              </p>
            </div>

            <div className="card-shadow rounded-card border-2 border-violet/20 bg-paper px-5 py-5">
              <h2 className="font-display text-[19px] font-extrabold uppercase leading-tight tracking-tight text-ink">
                {t(copy, "empty_title")}
              </h2>
              <p className="mt-2 font-sans text-[15px] leading-snug text-steel">
                {t(copy, "empty_body")}
              </p>
              <p className="mt-4 font-sans text-[15px] leading-snug text-ink">
                {t(copy, "contribute")}
              </p>
              <a
                href={`mailto:${email}`}
                className="pressable mt-3 flex items-center justify-center gap-2 rounded-chip bg-violet px-4 py-3 font-mono text-[14px] text-paper"
              >
                <MailGlyph />
                {email}
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 pt-4">
              <Select value={selectedState || UNSELECTED} onValueChange={onSelect}>
                <SelectTrigger className="h-[56px] w-full rounded-card border-2 border-ink/10 bg-paper px-4 font-sans text-[16px] text-ink">
                  <SelectValue placeholder={t(copy, "select_state")} />
                </SelectTrigger>
                <SelectContent className="rounded-card border-2 border-ink/10 bg-paper">
                  <SelectItem
                    value={UNSELECTED}
                    className="h-[56px] font-sans text-[16px]"
                  >
                    {t(copy, "all_states")}
                  </SelectItem>
                  {allStateScopes.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      className="h-[56px] font-sans text-[16px]"
                    >
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="px-4 pt-5 font-sans text-[15px] leading-snug text-steel">
              {t(copy, "banner")}
            </p>

            {national.length > 0 && (
              <section>
                <SectionHeading>{t(copy, "national")}</SectionHeading>
                <div className="flex flex-col gap-2.5 px-4">
                  {national.map((e, i) => (
                    <Row key={`n-${i}`} entry={e} t={t} />
                  ))}
                </div>
              </section>
            )}

            {selectedState && forSelected.length > 0 && (
              <section>
                <SectionHeading>
                  {t(copy, "your_state")} — {selectedState}
                </SectionHeading>
                <div className="flex flex-col gap-2.5 px-4">
                  {forSelected.map((e, i) => (
                    <Row key={`s-${i}`} entry={e} t={t} />
                  ))}
                </div>
              </section>
            )}

            {otherStates.length > 0 && (
              <details className="group px-4 pt-6">
                <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-[12px] font-bold uppercase tracking-wider text-steel [&::-webkit-details-marker]:hidden">
                  <span>{t(copy, "other_states")}</span>
                  <span className="font-mono group-open:hidden">+</span>
                  <span className="hidden font-mono group-open:inline">−</span>
                </summary>
                <div className="flex flex-col gap-2.5 pt-3">
                  {otherStates.map((e, i) => (
                    <Row key={`o-${i}`} entry={e} t={t} />
                  ))}
                </div>
              </details>
            )}

            {/* Contribution prompt stays visible once numbers exist. */}
            <div className="px-4 pb-12 pt-8">
              <p className="font-sans text-[15px] leading-snug text-steel">
                {t(copy, "contribute")}
              </p>
              <a
                href={`mailto:${email}`}
                className="pressable mt-3 flex items-center justify-center gap-2 rounded-chip bg-violet px-4 py-3 font-mono text-[14px] text-paper"
              >
                <MailGlyph />
                {email}
              </a>
            </div>
          </>
        )}

        <div className="py-10" />
      </div>
    </div>
  );
}
