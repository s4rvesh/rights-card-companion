import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import home from "../content/home.json";
import { useLang, type Lang } from "../i18n/useLang";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rights Card" },
      {
        name: "description",
        content:
          "Offline pocket reference for your rights on arrest, legal aid contacts, and emergency medical guidance in India.",
      },
      { property: "og:title", content: "Rights Card" },
      {
        property: "og:description",
        content:
          "Offline pocket reference for your rights on arrest, legal aid contacts, and emergency medical guidance in India.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { lang, setLang, t } = useLang();

  // Four full-height stacked buttons. Order matches home.buttons; styling
  // per index below to satisfy the palette-only rule.
  const styles: Record<
    string,
    { className: string }
  > = {
    rights: {
      className: "bg-hivis text-ink",
    },
    detained: {
      className: "bg-ink text-paper",
    },
    legal: {
      className: "bg-alert text-paper",
    },
    medical: {
      className: "bg-paper text-ink border-y-2 border-ink",
    },
  };

  // Size ladder — rights is largest per spec, remaining three step down.
  const sizes: Record<string, string> = {
    rights: "text-[14vw] leading-none",
    detained: "text-[9vw] leading-none",
    legal: "text-[12vw] leading-none",
    medical: "text-[12vw] leading-none",
  };

  const targets = ["/rights", "/detained", "/legal", "/medical"] as const;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-paper">
      <nav
        aria-label="Primary"
        className="flex flex-1 flex-col"
        style={{ height: "calc(100vh - 44px)" }}
      >
        {home.buttons.map((btn, i) => (
          <Link
            key={btn.id}
            to={targets[i]}
            className={`flex flex-1 items-center justify-center px-4 font-display font-extrabold uppercase tracking-tight min-h-[25vh] ${styles[btn.id].className} ${sizes[btn.id]}`}
          >
            {t(btn, "label")}
          </Link>
        ))}
      </nav>
      <div className="flex h-[44px] shrink-0 items-center justify-between border-t-2 border-ink bg-paper px-3 text-ink">
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
          <span aria-hidden className="px-1">/</span>
          <LangButton
            active={lang === "hi"}
            onClick={() => setLang("hi")}
            label={home.lang_hi_label}
            code="hi"
          />
        </div>
        <Link
          to="/settings"
          className="font-mono text-sm underline underline-offset-2 min-h-0"
          style={{ minHeight: 0 }}
        >
          {t(home, "settings")}
        </Link>
      </div>
    </div>
  );
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
      className={`min-h-0 px-2 py-1 ${active ? "font-bold text-ink" : "text-steel"}`}
      style={{ minHeight: 0 }}
    >
      {label}
    </button>
  );
}
