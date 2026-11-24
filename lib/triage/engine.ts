// ---------------------------------------------------------------------------
// Triage engine – generic matcher
// ---------------------------------------------------------------------------
// Evaluates declarative `TriageRule`s against normalised user input.
// No per-rule functions; all clinical behaviour is encoded in the rule definitions.
//
// IMPORTANT: This engine is a *safety floor*. A result with `hasMatch: false`
// does **not** mean the situation is safe – it only means no specific rule fired.
// ---------------------------------------------------------------------------

import type {
  TriageInput,
  TriageMatch,
  TriageResult,
  TriageRule,
  Urgency,
} from "./types";
import { SYNONYMS } from "./synonyms";
import { RULES } from "./rules";

// ── constants ────────────────────────────────────────────────────────────────

const DISCLAIMER =
  "This is guidance only, not a medical diagnosis. " +
  "Always consult a qualified healthcare professional. " +
  "If you believe you are experiencing a medical emergency, " +
  "call your local emergency number immediately.";

/** Urgency sort order – lower index = more critical. */
const URGENCY_ORDER: Urgency[] = [
  "emergency",
  "urgent",
  "see-clinician",
  "self-care",
];

// ── normalisation helpers ────────────────────────────────────────────────────

function buildSynonymLookup(): Map<string, string> {
  const map = new Map<string, string>();
  for (const [canonical, alternatives] of Object.entries(SYNONYMS)) {
    map.set(canonical, canonical);
    for (const alt of alternatives) {
      map.set(alt, canonical);
    }
  }
  return map;
}

const synonymLookup = buildSynonymLookup();

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalise a string:
 * - Replace curly apostrophes with standard single quotes
 * - Replace curly quotation marks
 * - Convert to lowercase
 * - Collapse multiple whitespace characters to single spaces and trim
 * - Expand known synonyms using word boundary checks
 */
export function normalise(text: string): string {
  let normalised = text
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  // Replace recognised alternative phrases with canonical phrases.
  // Sort longer phrases first so specific phrases match before shorter components.
  const entries = [...synonymLookup.entries()].sort(
    (a, b) => b[0].length - a[0].length,
  );

  for (const [alt, canonical] of entries) {
    if (alt === canonical) continue;
    const escaped = escapeRegExp(alt);
    const re = new RegExp(`(?<=^|\\W)${escaped}(?=$|\\W)`, "g");
    normalised = normalised.replace(re, canonical);
  }

  return normalised;
}

// ── phrase matching ──────────────────────────────────────────────────────────

/**
 * Check whether `text` contains `phrase` at word boundaries.
 * Prevents false positives like "heartburn" triggering "burn".
 */
export function containsPhrase(text: string, phrase: string): boolean {
  const escaped = escapeRegExp(phrase.toLowerCase().trim());
  const re = new RegExp(`(?<=^|\\W)${escaped}(?=$|\\W)`, "i");
  return re.test(text);
}

// ── rule evaluation ──────────────────────────────────────────────────────────

function evaluateRule(
  rule: TriageRule,
  normalisedText: string,
  input: TriageInput,
): TriageMatch | null {
  const matchedPhrases: string[] = [];

  // ── demographic / age gate ─────────────────────────────────────────
  if (rule.ageRange) {
    const { minMonths = 0, maxMonths = Infinity, category, fallbackCategory } =
      rule.ageRange;

    if (input.ageMonths !== undefined) {
      if (input.ageMonths < minMonths || input.ageMonths >= maxMonths) {
        return null;
      }
    } else if (input.ageRange) {
      // Age in months not provided; check coarse category
      if (fallbackCategory && input.ageRange === fallbackCategory) {
        // Matches fallback (e.g. infant with missing ageMonths falls back to stricter rule)
      } else if (category && input.ageRange === category && !fallbackCategory) {
        return null;
      } else if (category && input.ageRange !== category) {
        return null;
      } else if (!category && !fallbackCategory) {
        return null;
      }
    } else {
      // Age is completely missing and this rule requires an age range
      return null;
    }
  }

  // ── severity gate ──────────────────────────────────────────────────
  if (rule.minSeverity !== undefined) {
    if (input.severity === undefined || input.severity < rule.minSeverity) {
      return null;
    }
  }

  // ── anyOfAll: OR of AND groups ─────────────────────────────────────
  if (rule.anyOfAll) {
    let groupMatched = false;
    for (const group of rule.anyOfAll) {
      if (group.every((phrase) => containsPhrase(normalisedText, phrase))) {
        matchedPhrases.push(...group);
        groupMatched = true;
        break;
      }
    }
    if (!groupMatched) return null;
  }

  // ── allOf: every phrase must appear ────────────────────────────────
  if (rule.allOf) {
    for (const phrase of rule.allOf) {
      if (!containsPhrase(normalisedText, phrase)) return null;
      matchedPhrases.push(phrase);
    }
  }

  // ── anyOf / minMatchCount: at least minMatchCount phrases must appear
  if (rule.anyOf) {
    const requiredCount = rule.minMatchCount ?? 1;
    let matchCount = 0;
    for (const phrase of rule.anyOf) {
      if (containsPhrase(normalisedText, phrase)) {
        matchedPhrases.push(phrase);
        matchCount++;
      }
    }
    if (matchCount < requiredCount) return null;
  }

  return { rule, matchedPhrases };
}

// ── public API ───────────────────────────────────────────────────────────────

/**
 * Run the triage engine over the given input.
 *
 * Returns `hasMatch: true` when at least one rule fires.
 * **`hasMatch: false` does NOT mean safe** – it means no rule matched.
 */
export function triage(
  input: TriageInput,
  rules: TriageRule[] = RULES,
): TriageResult {
  const raw = [input.freeText, ...(input.symptoms ?? [])].join(" ");
  const normalisedText = normalise(raw);

  const matches: TriageMatch[] = [];

  for (const rule of rules) {
    const match = evaluateRule(rule, normalisedText, input);
    if (match) matches.push(match);
  }

  // Sort by urgency (most critical first)
  matches.sort(
    (a, b) =>
      URGENCY_ORDER.indexOf(a.rule.urgency) -
      URGENCY_ORDER.indexOf(b.rule.urgency),
  );

  return {
    hasMatch: matches.length > 0,
    matches,
    urgency: matches.length > 0 ? matches[0].rule.urgency : undefined,
    disclaimer: DISCLAIMER,
  };
}
