import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import rights from "@/content/rights.json";
import type { Right } from "@/content/types";
import { useLang } from "@/i18n/useLang";
import {
  DisclosureList,
  DisclosureItem,
  Block,
  LawBlock,
} from "@/components/Disclosure";

export const Route = createFileRoute("/rights")({
  head: () => ({
    meta: [
      { title: "My Rights — Rights Card" },
      {
        name: "description",
        content:
          "Your rights on arrest in India, in plain language with the exact legal source. Offline reference.",
      },
      { property: "og:title", content: "My Rights — Rights Card" },
      {
        property: "og:description",
        content:
          "Your rights on arrest in India, in plain language with the exact legal source. Offline reference.",
      },
    ],
  }),
  component: RightsScreen,
});

const RIGHTS = rights as Right[];

const COPY = {
  title_en: "My rights",
  title_hi: "मेरे अधिकार",
  back_en: "Home",
  back_hi: "होम",
  meaning_en: "What this means",
  meaning_hi: "इसका अर्थ",
  law_en: "The law",
  law_hi: "कानून",
  officer_en: "Show to officer",
  officer_hi: "अधिकारी को दिखाएँ",
  export_en: "Export as lock screen",
  export_hi: "लॉक स्क्रीन के रूप में सहेजें",
  exit_en: "Long-press anywhere to exit",
  exit_hi: "बाहर निकलने के लिए कहीं भी देर तक दबाएँ",
};

function RightsScreen() {
  const { t } = useLang();
  const [officer, setOfficer] = useState<Right | null>(null);

  const enterOfficer = useCallback(async (r: Right) => {
    setOfficer(r);
    try {
      const el = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    } catch {
      /* ignore */
    }
  }, []);

  const exitOfficer = useCallback(async () => {
    setOfficer(null);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }, []);

  // Officer mode: one right, edge-to-edge hi-vis, long-press to exit.
  if (officer) {
    let timer: number | null = null;
    const start = () => {
      timer = window.setTimeout(() => void exitOfficer(), 900);
    };
    const cancel = () => {
      if (timer) window.clearTimeout(timer);
      timer = null;
    };
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col justify-center bg-hivis px-8 text-ink"
        style={{ touchAction: "none" }}
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onPointerMove={cancel}
      >
        <h2 className="font-display text-[30px] font-extrabold uppercase leading-tight tracking-tight">
          {t(officer, "title")}
        </h2>
        <p className="mt-5 font-sans text-[22px] font-medium leading-snug">
          {t(officer, "body")}
        </p>
        <div className="mt-6 font-mono text-[12px] text-ink/70">
          {officer.source}
        </div>
        <div className="absolute inset-x-0 bottom-6 text-center font-mono text-[11px] uppercase tracking-wide text-ink/60">
          {t(COPY, "exit")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <div className="mx-auto flex max-w-2xl flex-col">
        <header className="flex items-center justify-between px-4 pt-4">
          <Link
            to="/"
            className="font-sans text-[14px] font-medium uppercase tracking-wide text-steel"
          >
            ← {t(COPY, "back")}
          </Link>
        </header>

        <h1 className="px-4 pb-4 pt-4 font-display text-[28px] font-extrabold uppercase text-ink">
          {t(COPY, "title")}
        </h1>

        <DisclosureList>
          {RIGHTS.map((r) => (
            <DisclosureItem key={r.id} value={r.id} title={t(r, "title")}>
              <Block label={t(COPY, "meaning")} body={t(r, "body")} />
              {r.law && r.law.length > 0 && (
                <LawBlock label={t(COPY, "law")} law={r.law} />
              )}
              <button
                type="button"
                onClick={() => void enterOfficer(r)}
                className="mt-1 w-full bg-ink px-4 py-3 font-display text-[14px] font-extrabold uppercase tracking-tight text-paper"
              >
                {t(COPY, "officer")}
              </button>
            </DisclosureItem>
          ))}
        </DisclosureList>

        <div className="px-4 py-8" />
      </div>
    </div>
  );
}
