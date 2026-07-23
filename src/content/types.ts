/**
 * Content layer types. Every user-visible string in the app must come from
 * a content object typed here — no literals in components.
 *
 * Bilingual fields use the _en / _hi suffix convention. Use useLang().t(obj)
 * to pick the correct one at render time.
 */

/**
 * A single legal reference shown in the nested "THE LAW" expander.
 * verbatim=true  → `text` is exact quoted text (used for constitutional
 *                  articles), rendered as a quote.
 * verbatim=false → `text` is our plain-language summary of a statute
 *                  section, rendered plainly and marked "(summary)".
 */
export type LawRef = {
  /** e.g. "Constitution, Article 22(1)" or "BNSS s.47(1)". */
  code: string;
  /** Exact quote (verbatim) or plain summary (not verbatim). */
  text: string;
  verbatim: boolean;
};

export type Right = {
  id: string;
  title_en: string;
  title_hi: string;
  body_en: string;
  body_hi: string;
  /** Short legal citation shown on the card, e.g. "BNSS s.47(1)". */
  source: string;
  /** Optional exact codes + quotes shown in the nested "THE LAW" expander. */
  law?: LawRef[];
};

export type DetainedStep = {
  step: number;
  title_en: string;
  title_hi: string;
  detail_en: string;
  detail_hi: string;
  /** Optional exact codes + quotes shown in the nested "THE LAW" expander. */
  law?: LawRef[];
};

export type LegalAidContact = {
  name_en: string;
  name_hi: string;
  /** Digits-only or +country-code format; rendered inside a tel: link. */
  phone: string;
  /** "national" or an Indian state/UT name. */
  scope: "national" | string;
};

export type MedicalCard = {
  id: string;
  condition_en: string;
  condition_hi: string;
  signs_en: string;
  signs_hi: string;
  actions_en: string;
  actions_hi: string;
  emergency_en: string;
  emergency_hi: string;
};

export type Hospital = {
  name: string;
  city: string;
  phone: string;
};

/** Any bilingual content object accepted by useLang().t(). */
export type Bilingual<K extends string> = {
  [P in `${K}_en` | `${K}_hi`]: string;
};
/** A "Do" or "Don't" behaviour item shown on the Before You Go screen. */
export type DoDontItem = {
  id: string;
  kind: "do" | "dont";
  title_en: string;
  title_hi: string;
  detail_en: string;
  detail_hi: string;
};

/** A packing checklist item. take=false means "leave this at home". */
export type ChecklistItem = {
  id: string;
  take: boolean;
  label_en: string;
  label_hi: string;
  note_en: string;
  note_hi: string;
};
