import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import home from "../content/home.json";
import { useLang, type Lang } from "../i18n/useLang";
import { onPwaEvent } from "../pwa/register";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Right2Protest" },
      {
        name: "description",
        content:
          "Offline pocket reference for your rights on arrest, legal aid contacts, and emergency medical guidance in India.",
      },
      { property: "og:title", content: "Right2Protest" },
      {
        property: "og:description",
        content:
          "Offline pocket reference for your rights on arrest, legal aid contacts, and emergency medical guidance in India.",
      },
    ],
  }),
  component: Index,
});

/* Per-card skin. Gradients are two-stop and shallow — enough to give the
   surface depth without hurting the contrast the labels need. */
const SKINS: Record<
  string,
  { bg: string; label: string; sub: string; chip: string }
> = {
  rights: {
    bg: "bg-[linear-gradient(145deg,#FFEE55_0%,#FFE600_45%,#FFC400_100%)]",
    label: "text-ink",
    sub: "text-ink/65",
    chip: "bg-ink/10 text-ink",
  },
  detained: {
    bg: "bg-[linear-gradient(145deg,#2A2A47_0%,#1E1E33_50%,#0D0D14_100%)]",
    label: "text-paper",
    sub: "text-paper/60",
    chip: "bg-paper/15 text-paper",
  },
  legal: {
    bg: "bg-[linear-gradient(145deg,#FF5C74_0%,#FF2E4C_50%,#DB0B2C_100%)]",
    label: "text-paper",
    sub: "text-paper/70",
    chip: "bg-paper/20 text-paper",
  },
  medical: {
    bg: "bg-[linear-gradient(145deg,#2BE3BC_0%,#00C9A0_50%,#00A183_100%)]",
    label: "text-ink",
    sub: "text-ink/60",
    chip: "bg-ink/10 text-ink",
  },
};

function Glyph({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {id === "rights" && (
        <>
          <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />
          <path d="M9.5 12l1.8 1.8L15 10" />
        </>
      )}
      {id === "detained" && (
        <>
          <circle cx="8" cy="12" r="3.2" />
          <circle cx="16" cy="12" r="3.2" />
          <path d="M11.2 12h1.6" />
        </>
      )}
      {id === "legal" && (
        <>
          <path d="M12 4v16M6 8h12" />
          <path d="M6 8l-2.5 5h5zM18 8l-2.5 5h5z" />
        </>
      )}
      {id === "medical" && (
        <>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <path d="M12 8v8M8 12h8" />
        </>
      )}
      {id === "before" && (
        <>
          <path d="M6 3.5h9l4 4V20a1 1 0 01-1 1H6a1 1 0 01-1-1V4.5a1 1 0 011-1z" />
          <path d="M8.5 12.5l2 2 4-4.5" />
        </>
      )}
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h13M12.5 6l6 6-6 6" />
    </svg>
  );
}

function Index() {
  const { lang, setLang, t } = useLang();
  const offlineReady = useOfflineReadyBar();

  const targets = ["/rights", "/detained", "/medical", "/legal"] as const;

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto flex max-w-lg flex-col px-4 pb-6 pt-5">
        <section className="card-shadow-lg relative overflow-hidden rounded-card bg-[linear-gradient(150deg,#2A2A47_0%,#16162A_55%,#0D0D14_100%)] px-4 py-4">
          <div
            aria-hidden
            className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-hivis/20 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-violet/25 blur-2xl"
          />
          <p className="relative whitespace-nowrap font-display text-[min(5.6vw,25px)] font-extrabold leading-[1.15] tracking-tight text-hivis">
            {t(home, "tagline")}
          </p>
          <p className="relative mt-1.5 font-sans text-[12.5px] leading-snug text-paper/65">
            {t(home, "quote")}
          </p>
        </section>

        <nav aria-label="Primary" className="mt-4 flex flex-col gap-3">
          {home.buttons.map((btn, i) => {
            const skin = SKINS[btn.id];
            return (
              <Link
                key={btn.id}
                to={targets[i]}
                className={`pressable card-shadow flex items-center gap-4 rounded-card px-5 py-5 ${skin.bg}`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-chip ${skin.chip}`}
                >
                  <Glyph id={btn.id} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block font-display text-[21px] font-extrabold uppercase leading-tight tracking-tight ${skin.label}`}
                  >
                    {t(btn, "label")}
                  </span>
                  <span
                    className={`mt-0.5 block font-sans text-[13px] leading-snug ${skin.sub}`}
                  >
                    {t(btn, "sub")}
                  </span>
                </span>
                <span className={skin.label}>
                  <Arrow />
                </span>
              </Link>
            );
          })}
        </nav>

        <Link
          to="/before"
          className="pressable card-shadow mt-3 flex items-center gap-4 rounded-card border-2 border-violet/25 bg-paper px-5 py-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip bg-violet/10 text-violet">
            <Glyph id="before" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[18px] font-extrabold uppercase leading-tight tracking-tight text-ink">
              {t(home, "before")}
            </span>
            <span className="mt-0.5 block font-sans text-[13px] leading-snug text-steel">
              {t(home, "before_sub")}
            </span>
          </span>
          <span className="text-violet">
            <Arrow />
          </span>
        </Link>

        <div className="card-shadow mt-5 flex items-center justify-center gap-1 self-center rounded-chip bg-paper px-2 py-1.5">
          <div
            role="group"
            aria-label="Language"
            className="flex items-center font-mono text-sm"
          >
            <LangButton
              active={lang === "en"}
              onClick={() => setLang("en")}
              label={home.lang_en_label}
              code="en"
            />
            <LangButton
              active={lang === "hi"}
              onClick={() => setLang("hi")}
              label={home.lang_hi_label}
              code="hi"
            />
          </div>
        </div>
      </div>

      {offlineReady ? (
        <div
          role="status"
          aria-live="polite"
          className="card-shadow-lg fixed inset-x-3 bottom-3 z-50 rounded-chip bg-ink px-4 py-3 text-center font-mono text-sm text-hivis"
        >
          {t(home, "offline_ready")}
        </div>
      ) : null}
    </div>
  );
}

const SESSION_KEY = "rc.offlineReadyShown";

function useOfflineReadyBar(): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      /* ignore */
    }
    const off = onPwaEvent((e) => {
      if (e !== "offline-ready") return;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      setShow(true);
      window.setTimeout(() => setShow(false), 3000);
    });
    return off;
  }, []);
  return show;
}

function LangButton({
  active,
  onClick,
  label,
  code,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  code: Lang;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={code}
      className={`min-h-0 rounded-chip px-3 py-1.5 text-[13px] ${
        active ? "bg-ink font-bold text-paper" : "text-steel"
      }`}
      style={{ minHeight: 0 }}
    >
      {label}
    </button>
  );
}
