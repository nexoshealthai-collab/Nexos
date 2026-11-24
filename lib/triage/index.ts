// ---------------------------------------------------------------------------
// lib/triage – public barrel
// ---------------------------------------------------------------------------
export { triage, normalise, containsPhrase } from "./engine";
export { RULES } from "./rules";
export { SYNONYMS } from "./synonyms";
export { DEFAULT_LOCALE, US_LOCALE, UK_LOCALE } from "./config";
export type { CrisisLine, LocaleConfig } from "./config";
export type {
  TriageInput,
  TriageMatch,
  TriageResult,
  TriageRule,
  Urgency,
  AgeCategory,
} from "./types";
