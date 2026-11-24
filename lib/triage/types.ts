// ---------------------------------------------------------------------------
// Triage engine – shared types
// ---------------------------------------------------------------------------

/** Urgency levels, ordered from most to least critical. */
export type Urgency = "emergency" | "urgent" | "see-clinician" | "self-care";

/** Supported age range categories for coarse demographic input. */
export type AgeCategory = "infant" | "child" | "adult" | "older-adult";

/** Special rule classification category. */
export type RuleCategory = "crisis" | "clinical";

/**
 * Declarative triage rule.
 *
 * The generic matcher in `engine.ts` evaluates these fields against the
 * user's input – no per-rule functions required.
 */
export interface TriageRule {
  /** Unique rule identifier (kebab-case). */
  id: string;

  /** Short human-readable label shown to the user. */
  label: string;

  /** Explicit urgency for every rule – required, never inferred. */
  urgency: Urgency;

  /** Optional rule category (e.g. "crisis"). */
  category?: RuleCategory | string;

  // ── phrase matching ──────────────────────────────────────────────────

  /**
   * Match if *any* of these phrases appear in the normalised input.
   * Phrases are matched at word boundaries after normalisation.
   */
  anyOf?: string[];

  /**
   * Match only if *all* of these phrases appear in the normalised input.
   * Combined with `anyOf` via AND (both must pass when both are present).
   */
  allOf?: string[];

  /**
   * Array of phrase sets (OR of ANDs).
   * A match occurs if at least one set in `anyOfAll` has ALL of its phrases present.
   */
  anyOfAll?: string[][];

  /**
   * Minimum number of phrases from `anyOf` that must appear.
   * Defaults to 1 when `anyOf` is present.
   */
  minMatchCount?: number;

  // ── demographic gates ────────────────────────────────────────────────

  /**
   * Age range filter.
   * - `minMonths` / `maxMonths`: age in months (inclusive lower, exclusive upper).
   * - `category`: coarse demographic bucket ("infant" | "child" | "adult" | "older-adult").
   * - `fallbackCategory`: when patient ageMonths is missing, matches if input.ageRange matches this category.
   */
  ageRange?: {
    minMonths?: number;
    maxMonths?: number;
    category?: AgeCategory;
    fallbackCategory?: AgeCategory;
  };

  /** Minimum severity (1–10 self-report scale) required. */
  minSeverity?: number;

  // ── guidance (user-facing, never diagnostic) ─────────────────────────

  /** Why this guidance was surfaced. */
  reasons: string[];

  /** Suggested next steps (guidance, not diagnosis). */
  nextSteps: string[];

  /** Signs the user should watch for. */
  warningSigns: string[];

  /** Has a clinician reviewed this rule's content? */
  reviewed: boolean;
}

/** A single matched rule together with which phrases triggered it. */
export interface TriageMatch {
  rule: TriageRule;
  matchedPhrases: string[];
}

/** Input payload for the triage engine. */
export interface TriageInput {
  /** Free-text description of symptoms / situation. */
  freeText: string;

  /** Optional structured symptom tags. */
  symptoms?: string[];

  /** Patient age in months (allows precise infant/pediatric rules). */
  ageMonths?: number;

  /** Patient age category if exact months is unknown (e.g. "infant", "older-adult"). */
  ageRange?: AgeCategory | string;

  /** Self-reported severity 1–10. */
  severity?: number;
}

/**
 * Engine output.
 *
 * `hasMatch` is explicit: **no match does NOT mean "safe"** – the engine
 * is a safety floor, not a diagnostic tool.
 */
export interface TriageResult {
  /** Whether any rule matched. */
  hasMatch: boolean;

  /** Matched rules sorted by urgency (most critical first). */
  matches: TriageMatch[];

  /** Overall urgency = most critical match, or `undefined` when no match. */
  urgency: Urgency | undefined;

  /** Static disclaimer attached to every result. */
  disclaimer: string;
}
