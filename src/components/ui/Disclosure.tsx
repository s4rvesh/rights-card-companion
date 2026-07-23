import * as AccordionPrimitive from "@radix-ui/react-accordion";
import type { ReactNode } from "react";
import type { LawRef } from "@/content/types";

/**
 * One uniform disclosure system used by every section (rights, detained,
 * medical) so the whole app expands and reads the same way.
 *
 *   <DisclosureList>
 *     <DisclosureItem value="x" title="TITLE" gutter="1">
 *       <Block label="WHAT TO DO" body="..." />
 *       <LawBlock law={[...]} />
 *     </DisclosureItem>
 *   </DisclosureList>
 *
 * The expand marker (+ → ×) rotates via group-data so ONLY the marker
 * turns — the title never rotates. (The old bug rotated every child span.)
 */

export function DisclosureList({ children }: { children: ReactNode }) {
  return (
    <AccordionPrimitive.Root type="multiple" className="flex flex-col gap-2.5 px-4">
      {children}
    </AccordionPrimitive.Root>
  );
}

export function DisclosureItem({
  value,
  title,
  gutter,
  children,
}: {
  value: string;
  title: string;
  /** Optional fixed left number/marker (used by the detained checklist). */
  gutter?: string;
  children: ReactNode;
}) {
  return (
    <AccordionPrimitive.Item
      value={value}
      className="card-shadow overflow-hidden rounded-card bg-paper data-[state=open]:ring-2 data-[state=open]:ring-violet/25"
    >
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="pressable group flex w-full items-start gap-3 px-4 py-4 text-left">
          {gutter !== undefined && (
            <span
              aria-hidden
              className="w-[28px] shrink-0 pt-[2px] font-display text-[22px] font-extrabold leading-none text-steel"
            >
              {gutter}
            </span>
          )}
          <span className="flex-1 font-display text-[18px] font-bold uppercase leading-tight tracking-tight text-ink">
            {title}
          </span>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-chip bg-canvas font-mono text-[17px] leading-none text-steel transition-transform duration-150 group-data-[state=open]:rotate-45 group-data-[state=open]:bg-violet group-data-[state=open]:text-paper">
            +
          </span>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden">
        <div className="flex flex-col gap-5 px-4 pb-6 pt-1">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

/** A labelled block of text — the shared unit every open item is built from. */
export function Block({
  label,
  body,
  emphasis,
}: {
  label: string;
  body: string;
  emphasis?: boolean;
}) {
  return (
    <div className={emphasis ? "border-l-[3px] border-alert pl-4" : ""}>
      <div
        className={`font-mono text-[11px] uppercase tracking-wide ${
          emphasis ? "text-alert" : "text-steel"
        }`}
      >
        {label}
      </div>
      <div className="pt-1 font-sans text-[18px] leading-snug text-ink">
        {body}
      </div>
    </div>
  );
}

/**
 * Nested "THE LAW" sub-expander shown inside a rights/detained item.
 * Verbatim constitutional quotes render in quote style; statute sections
 * that we summarise rather than quote are clearly marked as summaries.
 */
export function LawBlock({ label, law }: { label: string; law: LawRef[] }) {
  if (!law || law.length === 0) return null;
  return (
    <AccordionPrimitive.Root type="single" collapsible className="rounded-[14px] bg-canvas px-3 py-2.5">
      <AccordionPrimitive.Item value="law">
        <AccordionPrimitive.Header>
          <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between text-left">
            <span className="font-mono text-[11px] uppercase tracking-wide text-steel">
              {label}
            </span>
            <span className="font-mono text-[16px] leading-none text-steel transition-transform duration-150 group-data-[state=open]:rotate-45">
              +
            </span>
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className="overflow-hidden">
          <div className="flex flex-col gap-3 pt-3">
            {law.map((ref, i) => (
              <div key={`${ref.code}-${i}`}>
                <div className="font-mono text-[12px] font-medium text-ink">
                  {ref.code}
                </div>
                {ref.verbatim ? (
                  <blockquote className="mt-1 border-l-2 border-ink pl-3 font-sans text-[15px] italic leading-snug text-ink">
                    “{ref.text}”
                  </blockquote>
                ) : (
                  <div className="mt-1 font-sans text-[15px] leading-snug text-steel">
                    {ref.text}{" "}
                    <span className="font-mono text-[10px] uppercase">
                      (summary)
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
}
