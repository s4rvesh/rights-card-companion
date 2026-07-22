/**
 * Content layer types. Every user-visible string in the app must come from
 * a content object typed here — no literals in components.
 *
 * Bilingual fields use the _en / _hi suffix convention. Use useLang().t(obj)
 * to pick the correct one at render time.
 */

export type Right = {
  id: string;
  title_en: string;
  title_hi: string;
  body_en: string;
  body_hi: string;
  /** Short legal citation, e.g. "BNSS s.47(1)". */
  source: string;
};

export type DetainedStep = {
  step: number;
  title_en: string;
  title_hi: string;
  detail_en: string;
  detail_hi: string;
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