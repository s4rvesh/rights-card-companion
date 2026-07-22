import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import rights from "../content/rights.json";
import meta from "../content/meta.json";
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
        <DraftBanner t={t} />
        <CardBody right={current} t={t} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-paper">
      <DraftBanner t={t} />
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

function DraftBanner({
  t,
}: {
  t: (obj: Record<string, unknown>, key?: string) => string;
}) {
  return (
    <div
      role="note"
      className="shrink-0 bg-alert px-4 py-2 text-center font-sans font-semibold text-paper"
      style={{ fontSize: "14px", lineHeight: 1.3 }}
    >
      {t(meta, "draft_banner")}
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

// ---------- Lock-screen PNG export ----------
// Pure client-side. No html2canvas, no external libraries, no network.
// Draws directly to a 1170x2532 canvas (iPhone Pro portrait).

const LS_W = 1170;
const LS_H = 2532;
const COLOR_HIVIS = "#F2E205";
const COLOR_INK = "#0B0B0C";
const COLOR_STEEL = "#6B7078";

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth) {
      line = trial;
    } else {
      if (line) lines.push(line);
      // Word longer than maxWidth: hard-break by chars.
      if (ctx.measureText(word).width > maxWidth) {
        let chunk = "";
        for (const ch of word) {
          const t = chunk + ch;
          if (ctx.measureText(t).width > maxWidth) {
            if (chunk) lines.push(chunk);
            chunk = ch;
          } else {
            chunk = t;
          }
        }
        line = chunk;
      } else {
        line = word;
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCentered(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  cx: number,
  yTop: number,
  lineHeight: number,
): void {
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cx, yTop + i * lineHeight);
  }
}

async function exportRightAsLockScreen(
  right: Right,
  t: (obj: Record<string, unknown>, key?: string) => string,
): Promise<void> {
  // Ensure webfonts are ready so the canvas uses Archivo / JetBrains Mono.
  try {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }
  } catch {
    // ignore
  }

  const canvas = document.createElement("canvas");
  canvas.width = LS_W;
  canvas.height = LS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = COLOR_HIVIS;
  ctx.fillRect(0, 0, LS_W, LS_H);

  const sideMargin = 120;
  const maxWidth = LS_W - sideMargin * 2;

  const title = (t(right, "title") || "").toUpperCase();
  const body = t(right, "body") || "";
  const source = right.source || "";

  // Title
  const titleSize = 110;
  const titleLineHeight = Math.round(titleSize * 1.05);
  ctx.fillStyle = COLOR_INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = `800 ${titleSize}px "Archivo", "Noto Sans Devanagari", system-ui, sans-serif`;
  const titleLines = wrapLines(ctx, title, maxWidth);

  // Body
  const bodySize = 66;
  const bodyLineHeight = Math.round(bodySize * 1.35);
  ctx.font = `500 ${bodySize}px "Archivo", "Noto Sans Devanagari", system-ui, sans-serif`;
  const bodyLines = wrapLines(ctx, body, maxWidth);

  const gap = 90;
  const blockHeight =
    titleLines.length * titleLineHeight + gap + bodyLines.length * bodyLineHeight;
  const blockTop = Math.max(180, Math.round((LS_H - blockHeight) / 2));

  // Draw title
  ctx.font = `800 ${titleSize}px "Archivo", "Noto Sans Devanagari", system-ui, sans-serif`;
  drawCentered(ctx, titleLines, LS_W / 2, blockTop, titleLineHeight);

  // Draw body
  ctx.font = `500 ${bodySize}px "Archivo", "Noto Sans Devanagari", system-ui, sans-serif`;
  drawCentered(
    ctx,
    bodyLines,
    LS_W / 2,
    blockTop + titleLines.length * titleLineHeight + gap,
    bodyLineHeight,
  );

  // Source, bottom, steel, mono
  const sourceSize = 34;
  ctx.font = `400 ${sourceSize}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillStyle = COLOR_STEEL;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(source, LS_W / 2, LS_H - 160);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png"),
  );
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const safe = (t(right, "title") || right.id || "right")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rights-card-${safe || "lockscreen"}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
