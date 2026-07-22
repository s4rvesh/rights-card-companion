import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import rights from "../content/rights.json";
import type { Right } from "../content/types";
import { useLang } from "../i18n/useLang";

export const Route = createFileRoute("/rights")({
  head: () => ({
    meta: [
      { title: "My Rights — Rights Card" },
      {
        name: "description",
        content:
          "Swipeable pocket reference of your rights on arrest in India, usable offline.",
      },
      { property: "og:title", content: "My Rights — Rights Card" },
      {
        property: "og:description",
        content:
          "Swipeable pocket reference of your rights on arrest in India, usable offline.",
      },
    ],
  }),
  component: RightsScreen,
});

const CARDS: Right[] = rights as Right[];

function RightsScreen() {
  const { t } = useLang();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [officerMode, setOfficerMode] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Track current card via scroll position.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const i = Math.round(el.scrollLeft / el.clientWidth);
        setIndex((prev) => (prev === i ? prev : i));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Wake lock ref for officer mode.
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const enterOfficerMode = useCallback(async () => {
    setOfficerMode(true);
    // Fullscreen
    try {
      const el = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    } catch {
      // ignore
    }
    // Wake lock
    try {
      const nav = navigator as Navigator & {
        wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
      };
      if (nav.wakeLock?.request) {
        wakeLockRef.current = await nav.wakeLock.request("screen");
      }
    } catch {
      // ignore
    }
  }, []);

  const exitOfficerMode = useCallback(async () => {
    setOfficerMode(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      // ignore
    }
    try {
      await wakeLockRef.current?.release();
    } catch {
      // ignore
    }
    wakeLockRef.current = null;
  }, []);

  // Long-press (2s) anywhere to exit officer mode.
  useEffect(() => {
    if (!officerMode) return;
    let timer: number | null = null;
    const start = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void exitOfficerMode();
      }, 2000);
    };
    const cancel = () => {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
    };
    window.addEventListener("pointerdown", start);
    window.addEventListener("pointerup", cancel);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("pointermove", cancel);
    return () => {
      cancel();
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("pointerup", cancel);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("pointermove", cancel);
    };
  }, [officerMode, exitOfficerMode]);

  // Sync officer mode state if the user exits fullscreen via ESC.
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && officerMode) {
        void exitOfficerMode();
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [officerMode, exitOfficerMode]);

  const current = CARDS[index] ?? CARDS[0];

  const exportLockScreen = useCallback(async () => {
    if (!current) return;
    setExporting(true);
    try {
      await exportRightAsLockScreen(current, t);
    } finally {
      setExporting(false);
    }
  }, [current, t]);

  if (officerMode && current) {
    // Locked single-card view. No swipe, no chrome. Long-press to exit.
    return (
      <div
        className="fixed inset-0 flex flex-col bg-hivis text-ink"
        style={{ touchAction: "none" }}
      >
        <CardBody right={current} t={t} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-paper">
      <div
        ref={scrollerRef}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {CARDS.map((r) => (
          <section
            key={r.id}
            className="flex h-full w-full shrink-0 snap-center snap-always bg-hivis text-ink"
          >
            <CardBody right={r} t={t} />
          </section>
        ))}
      </div>

      {/* Dots */}
      <div
        role="tablist"
        aria-label="Rights position"
        className="flex shrink-0 items-center justify-center gap-2 bg-paper py-3"
      >
        {CARDS.map((r, i) => (
          <span
            key={r.id}
            aria-label={`${i + 1} of ${CARDS.length}`}
            className={`h-2 w-2 rounded-full ${i === index ? "bg-ink" : "bg-steel"}`}
          />
        ))}
      </div>

      {/* Show to officer */}
      <div className="shrink-0 border-t-2 border-ink bg-paper p-3">
        <button
          type="button"
          onClick={() => void enterOfficerMode()}
          className="w-full bg-ink px-4 py-4 font-display text-lg font-extrabold uppercase tracking-tight text-paper"
        >
          Show to officer
        </button>
        <button
          type="button"
          onClick={() => void exportLockScreen()}
          disabled={exporting}
          className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 font-display text-sm font-extrabold uppercase tracking-tight text-ink disabled:opacity-50"
        >
          {exporting ? "Exporting…" : "Export as lock screen"}
        </button>
      </div>

      {/* Back link — small, top-left, unobtrusive */}
      <Link
        to="/"
        aria-label="Back"
        className="fixed left-3 top-3 z-10 min-h-0 bg-ink px-2 py-1 font-mono text-xs text-paper"
        style={{ minHeight: 0 }}
      >
        ← HOME
      </Link>
    </div>
  );
}

function CardBody({
  right,
  t,
}: {
  right: Right;
  t: (obj: Record<string, unknown>, key?: string) => string;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col justify-center px-8 py-12">
      <h2
        className="font-display font-extrabold uppercase tracking-tight"
        style={{ fontSize: "28px", lineHeight: 1.05 }}
      >
        {t(right, "title")}
      </h2>
      <p
        className="mt-6 font-sans"
        style={{ fontSize: "22px", fontWeight: 500, lineHeight: 1.35 }}
      >
        {t(right, "body")}
      </p>
      <div
        className="mt-auto pt-8 font-mono text-steel"
        style={{ fontSize: "12px" }}
      >
        {right.source}
      </div>
    </div>
  );
}
