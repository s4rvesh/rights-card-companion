import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import checklist from "@/content/checklist.json";
import dosdonts from "@/content/dosdonts.json";
import copy from "@/content/beforeUi.json";
import type { ChecklistItem, DoDontItem } from "@/content/types";
import { useLang } from "@/i18n/useLang";
import { DisclosureList, DisclosureItem, Block } from "@/components/Disclosure";

export const Route = createFileRoute("/before")({
  head: () => ({
    meta: [
      { title: "Before You Go — Rights Card" },
      {
        name: "description",
        content:
          "What to pack for a protest, what to leave at home, and what to do and not do. Offline reference.",
      },
      { property: "og:title", content: "Before You Go — Rights Card" },
      {
        property: "og:description",
        content:
          "What to pack for a protest, what to leave at home, and what to do and not do. Offline reference.",
      },
    ],
  }),
  component: BeforeScreen,
});

const ITEMS = checklist as ChecklistItem[];
const RULES = dosdonts as DoDontItem[];

const PACK_KEY = "rc.packed";

function readPacked(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PACK_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function writePacked(ids: string[]) {
  try {
    window.localStorage.setItem(PACK_KEY, JSON.stringify(ids));
  } catch {
    /* ignore — checklist state is a convenience, not load-bearing */
  }
}

/** Section heading in the shared visual language (mono, uppercase, rule). */
function SectionHead({ children }: { children: string }) {
  return (
    <h2 className="px-4 pb-2 pt-6 font-mono text-[12px] font-bold uppercase tracking-wider text-steel">
      {children}
    </h2>
  );
}

function CheckRow({
  item,
  checked,
  onToggle,
  label,
  note,
}: {
  item: ChecklistItem;
  checked: boolean;
  onToggle: (id: string) => void;
  label: string;
  note: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      aria-pressed={checked}
      className={`pressable card-shadow mx-4 flex w-[calc(100%-2rem)] items-start gap-3 rounded-card px-4 py-4 text-left ${
        checked ? "bg-canvas" : "bg-paper"
      }`}
    >
      <span
        aria-hidden
        className={`mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border-2 font-mono text-[15px] leading-none transition-colors ${
          checked
            ? item.take
              ? "border-mint bg-mint text-ink"
              : "border-alert bg-alert text-paper"
            : "border-steel/40 bg-canvas text-transparent"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block font-sans text-[17px] font-semibold leading-snug ${
            checked ? "text-steel line-through" : "text-ink"
          }`}
        >
          {label}
        </span>
        <span className="mt-1 block font-sans text-[15px] leading-snug text-steel">
          {note}
        </span>
      </span>
    </button>
  );
}

function BeforeScreen() {
  const { t } = useLang();
  const [packed, setPacked] = useState<string[]>([]);

  useEffect(() => {
    setPacked(readPacked());
  }, []);

  const toggle = useCallback((id: string) => {
    setPacked((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      writePacked(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setPacked([]);
    writePacked([]);
  }, []);

  const take = ITEMS.filter((i) => i.take);
  const avoid = ITEMS.filter((i) => !i.take);
  const dos = RULES.filter((r) => r.kind === "do");
  const donts = RULES.filter((r) => r.kind === "dont");

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <div className="mx-auto flex max-w-2xl flex-col">
        <header className="flex items-center justify-between px-4 pt-4">
          <Link
            to="/"
            className="font-sans text-[14px] font-medium uppercase tracking-wide text-steel"
          >
            ← {t(copy, "back")}
          </Link>
        </header>

        <h1 className="px-4 pb-2 pt-4 font-display text-[28px] font-extrabold uppercase text-ink">
          {t(copy, "title")}
        </h1>
        <p className="px-4 pb-4 font-sans text-[15px] leading-snug text-steel">
          {t(copy, "intro")}
        </p>

        {/* --- Packing checklist ------------------------------------------ */}
        <SectionHead>{t(copy, "take")}</SectionHead>
        <div className="flex flex-col gap-2.5">
        {take.map((item) => (
          <CheckRow
            key={item.id}
            item={item}
            checked={packed.includes(item.id)}
            onToggle={toggle}
            label={t(item, "label")}
            note={t(item, "note")}
          />
        ))}
        </div>

        <SectionHead>{t(copy, "avoid")}</SectionHead>
        <div className="flex flex-col gap-2.5">
        {avoid.map((item) => (
          <CheckRow
            key={item.id}
            item={item}
            checked={packed.includes(item.id)}
            onToggle={toggle}
            label={t(item, "label")}
            note={t(item, "note")}
          />
        ))}
        </div>

        <div className="px-4 py-4">
          <button
            type="button"
            onClick={reset}
            className="font-mono text-[12px] uppercase tracking-wide text-steel underline underline-offset-2"
          >
            {t(copy, "reset")}
          </button>
        </div>

        {/* --- Do --------------------------------------------------------- */}
        <SectionHead>{t(copy, "do")}</SectionHead>
        <DisclosureList>
          {dos.map((r) => (
            <DisclosureItem
              key={r.id}
              value={r.id}
              gutter="✓"
              title={t(r, "title")}
            >
              <Block label={t(copy, "why")} body={t(r, "detail")} />
            </DisclosureItem>
          ))}
        </DisclosureList>

        {/* --- Don't ------------------------------------------------------ */}
        <SectionHead>{t(copy, "dont")}</SectionHead>
        <DisclosureList>
          {donts.map((r) => (
            <DisclosureItem
              key={r.id}
              value={r.id}
              gutter="✕"
              title={t(r, "title")}
            >
              <Block label={t(copy, "why")} body={t(r, "detail")} emphasis />
            </DisclosureItem>
          ))}
        </DisclosureList>

        <div className="py-12" />
      </div>
    </div>
  );
}
