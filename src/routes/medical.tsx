import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import medical from "@/content/medical.json";
import hospitals from "@/content/hospitals.json";
import copy from "@/content/medicalUi.json";
import type { MedicalCard, Hospital } from "@/content/types";
import { useLang } from "@/i18n/useLang";
import { DisclosureList, DisclosureItem, Block } from "@/components/Disclosure";

export const Route = createFileRoute("/medical")({
  component: MedicalScreen,
  head: () => ({
    meta: [
      { title: "Medical — Rights Card" },
      {
        name: "description",
        content:
          "First-aid signs, actions, and emergency criteria for common conditions. Offline reference.",
      },
      { property: "og:title", content: "Medical — Rights Card" },
      {
        property: "og:description",
        content:
          "First-aid signs, actions, and emergency criteria for common conditions. Offline reference.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const STATE_KEY = "rc.state";

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

function MedicalScreen() {
  const { t } = useLang();
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    setSelectedState(readStoredState());
  }, []);

  const cards = medical as MedicalCard[];
  const allHospitals = hospitals as Hospital[];

  const nearby = useMemo(() => {
    if (!selectedState) return [];
    const s = selectedState.toLowerCase();
    return allHospitals.filter((h) => {
      const c = h.city.toLowerCase();
      return c.includes(s) || s.includes(c);
    });
  }, [allHospitals, selectedState]);

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex max-w-2xl flex-col">
        <header className="flex items-center justify-between px-4 pt-4">
          <Link
            to="/"
            className="font-sans text-[14px] font-medium uppercase tracking-wide text-steel"
          >
            ← {t(copy, "back")}
          </Link>
        </header>

        <h1 className="px-4 pb-4 pt-4 font-display text-[28px] font-extrabold uppercase text-ink">
          {t(copy, "title")}
        </h1>

        <DisclosureList>
          {cards.map((card) => (
            <DisclosureItem
              key={card.id}
              value={card.id}
              title={t(card, "condition")}
            >
              <Block label={t(copy, "signs")} body={t(card, "signs")} />
              <Block label={t(copy, "actions")} body={t(card, "actions")} />
              <Block
                label={t(copy, "emergency")}
                body={t(card, "emergency")}
                emphasis
              />
            </DisclosureItem>
          ))}
        </DisclosureList>

        <section className="pb-12 pt-8">
          <h2 className="border-b border-ink bg-paper px-4 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-ink">
            {t(copy, "hospitals")}
            {selectedState ? ` — ${selectedState}` : ""}
          </h2>
          {!selectedState && (
            <p className="px-4 py-4 font-sans text-[15px] leading-snug text-steel">
              {t(copy, "no_state")}
            </p>
          )}
          {selectedState && nearby.length === 0 && (
            <p className="px-4 py-4 font-sans text-[15px] leading-snug text-steel">
              {t(copy, "no_hospitals")}
            </p>
          )}
          {nearby.map((h, i) => (
            <a
              key={`${h.name}-${i}`}
              href={`tel:${h.phone}`}
              className="flex h-[72px] w-full items-center justify-between border-b border-steel/40 px-4 text-ink"
            >
              <div className="min-w-0 flex-1 pr-4">
                <div className="truncate font-sans text-[18px] font-semibold text-ink">
                  {h.name}
                </div>
                <div className="truncate font-mono text-[16px] text-steel">
                  {h.phone} · {h.city}
                </div>
              </div>
              <PhoneGlyph />
            </a>
          ))}
        </section>
      </div>
    </div>
  );
}
