import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import copy from "@/content/card.json";
import { useLang } from "@/i18n/useLang";

export const Route = createFileRoute("/card")({
  component: CardScreen,
  head: () => ({
    meta: [
      { title: "My Card — Rights Card" },
      {
        name: "description",
        content:
          "Store your name, emergency contact, and medical info on this device only.",
      },
      { property: "og:title", content: "My Card — Rights Card" },
      {
        property: "og:description",
        content:
          "Store your name, emergency contact, and medical info on this device only.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const STORAGE_KEY = "rc.card";

type CardData = {
  name: string;
  phone: string;
  medical: string;
};

const EMPTY: CardData = { name: "", phone: "", medical: "" };

function readCard(): CardData {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<CardData>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      medical: typeof parsed.medical === "string" ? parsed.medical : "",
    };
  } catch {
    return EMPTY;
  }
}

function writeCard(next: CardData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode): values still apply for the session.
  }
}

function CardScreen() {
  const { lang, t } = useLang();
  const [data, setData] = useState<CardData>(EMPTY);
  const [savedAt, setSavedAt] = useState(0);
  const [showing, setShowing] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setData(readCard());
  }, []);

  function onBlurSave(field: keyof CardData, value: string) {
    const next = { ...data, [field]: value };
    setData(next);
    writeCard(next);
    setSavedAt(Date.now());
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => setSavedAt(0), 1600);
  }

  function onChange(field: keyof CardData, value: string) {
    setData((d) => ({ ...d, [field]: value }));
  }

  const inputClass =
    "h-[56px] w-full rounded-none border-2 border-ink bg-paper px-4 font-sans text-[18px] text-ink placeholder:text-steel focus:outline-none focus:ring-0";
  const labelClass =
    "block pb-2 font-sans text-[12px] font-bold uppercase tracking-wider text-steel";

  if (showing) {
    return <ShowCard data={data} onClose={() => setShowing(false)} t={t} lang={lang} />;
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex max-w-2xl flex-col px-4 pt-4 pb-12">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="font-sans text-[14px] font-medium uppercase tracking-wide text-steel"
          >
            ← {lang === "hi" ? "होम" : "HOME"}
          </Link>
          <span
            aria-live="polite"
            className="font-sans text-[14px] text-steel transition-opacity duration-500"
            style={{ opacity: savedAt ? 1 : 0 }}
          >
            {t(copy, "saved")}
          </span>
        </div>

        <h1 className="pt-4 pb-6 font-sans text-[28px] font-extrabold uppercase text-ink">
          {t(copy, "title")}
        </h1>

        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="rc-name" className={labelClass}>
              {t(copy, "name")}
            </label>
            <input
              id="rc-name"
              type="text"
              autoComplete="name"
              value={data.name}
              onChange={(e) => onChange("name", e.target.value)}
              onBlur={(e) => onBlurSave("name", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="rc-phone" className={labelClass}>
              {t(copy, "phone")}
            </label>
            <input
              id="rc-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={data.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              onBlur={(e) => onBlurSave("phone", e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label htmlFor="rc-medical" className={labelClass}>
              {t(copy, "medical")}
            </label>
            <input
              id="rc-medical"
              type="text"
              value={data.medical}
              onChange={(e) => onChange("medical", e.target.value)}
              onBlur={(e) => onBlurSave("medical", e.target.value)}
              className={inputClass}
            />
          </div>
        </form>

        <p className="pt-6 font-sans text-[15px] leading-snug text-alert">
          {t(copy, "warning")}
        </p>

        <button
          type="button"
          onClick={() => setShowing(true)}
          className="mt-8 h-[56px] w-full border-2 border-ink bg-ink font-sans text-[18px] font-extrabold uppercase tracking-wide text-paper"
        >
          {t(copy, "show")}
        </button>
      </div>
    </div>
  );
}

function ShowCard({
  data,
  onClose,
  t,
  lang,
}: {
  data: CardData;
  onClose: () => void;
  t: (o: Record<string, unknown>, k?: string) => string;
  lang: string;
}) {
  void lang;
  const empty = !data.name && !data.phone && !data.medical;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper text-ink">
      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-6">
        {empty ? (
          <p className="font-sans text-[28px] font-semibold text-steel">
            {t(copy, "empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {data.name && (
              <section>
                <div className="font-sans text-[14px] font-bold uppercase tracking-wider text-steel">
                  {t(copy, "label_name")}
                </div>
                <div className="pt-2 font-sans text-[44px] font-extrabold leading-tight text-ink">
                  {data.name}
                </div>
              </section>
            )}
            {data.phone && (
              <section>
                <div className="font-sans text-[14px] font-bold uppercase tracking-wider text-steel">
                  {t(copy, "label_phone")}
                </div>
                <a
                  href={`tel:${data.phone}`}
                  className="block pt-2 font-mono text-[44px] font-bold leading-tight text-ink underline decoration-2 underline-offset-4"
                >
                  {data.phone}
                </a>
              </section>
            )}
            {data.medical && (
              <section>
                <div className="font-sans text-[14px] font-bold uppercase tracking-wider text-alert">
                  {t(copy, "label_medical")}
                </div>
                <div className="pt-2 font-sans text-[36px] font-semibold leading-tight text-ink">
                  {data.medical}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="h-[56px] w-full border-t-2 border-ink bg-ink font-sans text-[18px] font-extrabold uppercase tracking-wide text-paper"
      >
        {t(copy, "close")}
      </button>
    </div>
  );
}