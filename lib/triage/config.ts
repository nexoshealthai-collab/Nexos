// ---------------------------------------------------------------------------
// Triage engine – locale / deployment config
// ---------------------------------------------------------------------------
// Country-specific phone numbers and resources live here, NOT in rule text.
// Rule `nextSteps` use generic wording ("your local emergency number").
// The UI layer should merge these numbers into the guidance it displays.
// DEFAULT_LOCALE uses purely generic wording with no assumptions about national hotlines.
// ---------------------------------------------------------------------------

export interface CrisisLine {
  /** Human-readable label. */
  label: string;
  /** Phone number, SMS short-code, or URL. */
  contact: string;
  /** Optional note (e.g. "call or text"). */
  note?: string;
}

export interface LocaleConfig {
  /** General emergency service guidance / identifier. */
  emergencyNumbers: string[];
  /** Poison control lines. */
  poisonControl: CrisisLine[];
  /** Suicide / mental-health crisis lines. */
  suicideCrisisLines: CrisisLine[];
  /** Self-harm / crisis text lines. */
  selfHarmCrisisLines: CrisisLine[];
}

/**
 * Default generic locale – contains NO country-specific numbers.
 * Does not assume a national suicide hotline exists.
 */
export const DEFAULT_LOCALE: LocaleConfig = {
  emergencyNumbers: ["local emergency services"],
  poisonControl: [
    {
      label: "Poison Control Center",
      contact: "local poison control hotline or emergency clinic",
      note: "consult local emergency guidance",
    },
  ],
  suicideCrisisLines: [
    {
      label: "Crisis Support",
      contact: "a local crisis line if one is available, a health worker, or someone you trust",
      note: "reach out for immediate support",
    },
  ],
  selfHarmCrisisLines: [
    {
      label: "Crisis Text Support",
      contact: "a local crisis line if one is available, a health worker, or someone you trust",
    },
  ],
};

/** United States locale configuration. */
export const US_LOCALE: LocaleConfig = {
  emergencyNumbers: ["911"],
  poisonControl: [
    { label: "Poison Help", contact: "1-800-222-1222" },
  ],
  suicideCrisisLines: [
    {
      label: "988 Suicide & Crisis Lifeline",
      contact: "988",
      note: "call or text",
    },
  ],
  selfHarmCrisisLines: [
    {
      label: "Crisis Text Line",
      contact: "741741",
      note: "text HOME to this number",
    },
    {
      label: "988 Suicide & Crisis Lifeline",
      contact: "988",
      note: "call or text",
    },
  ],
};

/** United Kingdom locale configuration. */
export const UK_LOCALE: LocaleConfig = {
  emergencyNumbers: ["999", "112"],
  poisonControl: [
    { label: "NHS 111", contact: "111" },
  ],
  suicideCrisisLines: [
    { label: "Samaritans", contact: "116 123", note: "free helpline" },
  ],
  selfHarmCrisisLines: [
    {
      label: "Crisis Text Line (UK)",
      contact: "85258",
      note: "text SHOUT to this number",
    },
    { label: "Samaritans", contact: "116 123" },
  ],
};
