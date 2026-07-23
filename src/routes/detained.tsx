import { createFileRoute, Link } from "@tanstack/react-router";
import detained from "@/content/detained.json";
import type { DetainedStep } from "@/content/types";
import { useLang } from "@/i18n/useLang";
import { DisclosureList, DisclosureItem, Block, LawBlock } from "@/components/Disclosure";

export const Route = createFileRoute("/detained")({
  head: () => ({
    meta: [
      { title: "I've Been Detained — Rights Card" },
      {
        name: "description",
        content:
          "Ordered checklist of what to do if you are detained by police in India, with the legal source for each step. Offline reference.",
      },
      { property: "og:title", content: "I've Been Detained — Rights Card" },
      {
        property: "og:description",
        content:
          "Ordered checklist of what to do if you are detained by police in India, with the legal source for each step. Offline reference.",
      },
    ],
  }),
  component: DetainedScreen,
});

const STEPS = detained as DetainedStep[];

const COPY = {
  title_en: "If you are detained",
  title_hi: "यदि आपको हिरासत में लिया जाए",
  banner_en: "Stay calm. Say your name. Say nothing else about today.",
  banner_hi: "शांत रहें। अपना नाम बताएं। आज के बारे में और कुछ न कहें।",
  action_en: "What to do",
  action_hi: "क्या करें",
  law_en: "The law",
  law_hi: "कानून",
  cta_en: "Call legal aid",
  cta_hi: "कानूनी सहायता को कॉल करें",
  back_en: "Home",
  back_hi: "होम",
};

function DetainedScreen() {
  const { t } = useLang();

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
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

        <p
          role="note"
          className="mx-4 mb-2 border-l-[3px] border-alert pl-4 font-sans text-[18px] font-semibold leading-snug text-alert"
        >
          {t(COPY, "banner")}
        </p>

        <DisclosureList>
          {STEPS.map((s) => (
            <DisclosureItem
              key={s.step}
              value={`step-${s.step}`}
              gutter={String(s.step)}
              title={t(s, "title")}
            >
              <Block label={t(COPY, "action")} body={t(s, "detail")} />
              {s.law && s.law.length > 0 && (
                <LawBlock label={t(COPY, "law")} law={s.law} />
              )}
            </DisclosureItem>
          ))}
        </DisclosureList>

        <div className="sticky bottom-0 mt-auto">
          <Link
            to="/legal"
            className="flex w-full items-center justify-center bg-alert px-4 py-5 font-display text-[22px] font-extrabold uppercase tracking-tight text-paper"
          >
            {t(COPY, "cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
