import { createFileRoute, Link } from "@tanstack/react-router";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import detained from "../content/detained.json";
import type { DetainedStep } from "../content/types";
import { useLang } from "../i18n/useLang";

export const Route = createFileRoute("/detained")({
  head: () => ({
    meta: [
      { title: "I've Been Detained — Rights Card" },
      {
        name: "description",
        content:
          "Ordered checklist of what to do if you are detained by police in India. Offline reference.",
      },
      { property: "og:title", content: "I've Been Detained — Rights Card" },
      {
        property: "og:description",
        content:
          "Ordered checklist of what to do if you are detained by police in India. Offline reference.",
      },
    ],
  }),
  component: DetainedScreen,
});

const STEPS = detained as DetainedStep[];

// Bilingual banner + CTA label. Kept here rather than a new JSON file so
// this screen ships without touching the content layout other users edit.
const COPY = {
  banner_en: "Stay calm. Say your name. Say nothing else about today.",
  banner_hi: "शांत रहें। अपना नाम बताएं। आज के बारे में और कुछ न कहें।",
  cta_en: "Call legal aid",
  cta_hi: "कानूनी सहायता को कॉल करें",
  back_en: "Home",
  back_hi: "होम",
};

function DetainedScreen() {
  const { t } = useLang();

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="flex items-center gap-3 border-b border-steel px-4 py-3">
        <Link
          to="/"
          aria-label={t(COPY, "back")}
          className="min-h-0 bg-ink px-2 py-1 font-mono text-xs text-paper"
          style={{ minHeight: 0 }}
        >
          ← {t(COPY, "back")}
        </Link>
      </header>

      <p
        role="note"
        className="border-b border-steel px-4 py-4 font-sans font-semibold text-alert"
        style={{ fontSize: "18px", lineHeight: 1.35 }}
      >
        {t(COPY, "banner")}
      </p>

      <AccordionPrimitive.Root type="single" collapsible className="flex-1">
        {STEPS.map((s) => (
          <AccordionPrimitive.Item
            key={s.step}
            value={`step-${s.step}`}
            className="border-b border-steel"
          >
            <div className="flex">
              <div
                aria-hidden
                className="flex w-[40px] shrink-0 items-start justify-center pt-4 font-display font-extrabold text-steel"
                style={{ fontSize: "28px", lineHeight: 1 }}
              >
                {s.step}
              </div>
              <AccordionPrimitive.Header className="flex flex-1">
                <AccordionPrimitive.Trigger
                  className="flex flex-1 items-center px-3 py-4 text-left font-display font-bold uppercase tracking-tight"
                  style={{ fontSize: "18px", minHeight: "3.5rem" }}
                >
                  {t(s, "title")}
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
            </div>
            <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div
                className="pb-5 pl-[40px] pr-4 font-sans"
                style={{ fontSize: "17px", lineHeight: 1.45 }}
              >
                {t(s, "detail")}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>

      <div className="sticky bottom-0 mt-auto">
        <Link
          to="/legal"
          className="flex w-full items-center justify-center bg-alert px-4 py-5 font-display font-extrabold uppercase tracking-tight text-paper"
          style={{ fontSize: "22px" }}
        >
          {t(COPY, "cta")}
        </Link>
      </div>
    </div>
  );
}