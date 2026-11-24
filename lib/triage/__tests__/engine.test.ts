// ---------------------------------------------------------------------------
// Triage engine – comprehensive test suite
// ---------------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import {
  triage,
  normalise,
  containsPhrase,
  RULES,
  DEFAULT_LOCALE,
  US_LOCALE,
  UK_LOCALE,
} from "../index";
import type { TriageInput } from "../types";
import { RULE_CASES } from "./rule-cases";

// ── helpers ──────────────────────────────────────────────────────────────────

function run(freeText: string, extra?: Partial<TriageInput>) {
  return triage({ freeText, ...extra });
}

function matchedIds(freeText: string, extra?: Partial<TriageInput>) {
  return run(freeText, extra).matches.map((m) => m.rule.id);
}

// ═══════════════════════════════════════════════════════════════════════════
//  1 · Meta & structural integrity
// ═══════════════════════════════════════════════════════════════════════════

describe("rule integrity", () => {
  it("every rule has a unique id", () => {
    const ids = RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("reconciles exact total rule count (29 rules)", () => {
    expect(RULES).toHaveLength(29);
  });

  it("every rule has reviewed: false (pending clinical review)", () => {
    for (const rule of RULES) {
      expect(rule.reviewed, `rule "${rule.id}" should be reviewed:false`).toBe(
        false,
      );
    }
  });

  it("every rule has an explicit urgency matching supported Urgency type", () => {
    const valid = ["emergency", "urgent", "see-clinician", "self-care"];
    for (const rule of RULES) {
      expect(
        valid,
        `rule "${rule.id}" has invalid urgency: ${rule.urgency}`,
      ).toContain(rule.urgency);
    }
  });

  it("every rule has at least one nextStep", () => {
    for (const rule of RULES) {
      expect(
        rule.nextSteps.length,
        `rule "${rule.id}" needs at least one nextStep`,
      ).toBeGreaterThan(0);
    }
  });

  it("no country-specific phone numbers in rule text (isolated in config.ts)", () => {
    const forbidden = ["911", "999", "112", "988", "741741", "116 123", "111", "85258"];
    for (const rule of RULES) {
      const allText = [
        rule.label,
        ...rule.reasons,
        ...rule.nextSteps,
        ...rule.warningSigns,
      ].join(" ");

      for (const num of forbidden) {
        expect(
          allText.includes(num),
          `rule "${rule.id}" contains specific number "${num}". Use generic guidance wording.`,
        ).toBe(false);
      }
    }
  });

  it("no rule text contains a phone-number-like digit sequence (3 or more digits)", () => {
    const phoneDigitRegex = /\b\d{3,}\b/;
    for (const rule of RULES) {
      const allText = [
        rule.label,
        ...rule.reasons,
        ...rule.nextSteps,
        ...rule.warningSigns,
      ].join(" ");

      expect(
        phoneDigitRegex.test(allText),
        `rule "${rule.id}" contains a digit sequence resembling a phone number in: "${allText}"`,
      ).toBe(false);
    }
  });

  it("no diagnostic wording in user-facing strings", () => {
    const diagnosticTerms = [
      "you have",
      "you are having",
      "diagnosis",
      "diagnosed",
      "we diagnose",
    ];
    for (const rule of RULES) {
      const strings = [
        rule.label,
        ...rule.reasons,
        ...rule.nextSteps,
        ...rule.warningSigns,
      ].map((s) => s.toLowerCase());

      for (const term of diagnosticTerms) {
        for (const s of strings) {
          expect(
            s.includes(term),
            `rule "${rule.id}" contains diagnostic wording "${term}" in: "${s}"`,
          ).toBe(false);
        }
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  2 · Structural rule coverage with it.each
// ═══════════════════════════════════════════════════════════════════════════

describe("structural rule coverage via rule-cases.ts", () => {
  it("fails if any rule in RULES has no entry in rule-cases.ts", () => {
    const caseIds = new Set(RULE_CASES.map((c) => c.ruleId));
    for (const rule of RULES) {
      expect(
        caseIds.has(rule.id),
        `Rule "${rule.id}" defined in RULES is missing from rule-cases.ts`,
      ).toBe(true);
    }
    expect(RULE_CASES).toHaveLength(RULES.length);
  });

  // Positive test per rule id
  it.each(RULE_CASES)(
    "rule-case positive: $ruleId matches",
    ({ ruleId, positive }) => {
      const posResult = triage(positive);
      const posMatched = posResult.matches.map((m) => m.rule.id);
      expect(
        posMatched,
        `Rule case "${ruleId}" positive input failed to match`,
      ).toContain(ruleId);
    },
  );

  // Negative test per rule id
  it.each(RULE_CASES)(
    "rule-case negative: $ruleId does not match",
    ({ ruleId, negative }) => {
      const negResult = triage(negative);
      const negMatched = negResult.matches.map((m) => m.rule.id);
      expect(
        negMatched,
        `Rule case "${ruleId}" negative input unexpectedly matched`,
      ).not.toContain(ruleId);
    },
  );
});

// ═══════════════════════════════════════════════════════════════════════════
//  3 · Locale config tests
// ═══════════════════════════════════════════════════════════════════════════

describe("locale config", () => {
  it("DEFAULT_LOCALE uses generic wording with no specific numbers", () => {
    const json = JSON.stringify(DEFAULT_LOCALE);
    expect(json).not.toMatch(/\b\d{3,}\b/);
    expect(DEFAULT_LOCALE.emergencyNumbers[0]).toContain("local emergency services");
  });

  it("DEFAULT_LOCALE does not assume a national suicide hotline exists", () => {
    const suicideLine = DEFAULT_LOCALE.suicideCrisisLines[0];
    expect(suicideLine.contact).toBe(
      "a local crisis line if one is available, a health worker, or someone you trust",
    );
  });

  it("provides UK locale with 999 and Samaritans 116 123", () => {
    expect(UK_LOCALE.emergencyNumbers).toContain("999");
    expect(UK_LOCALE.suicideCrisisLines.some((l) => l.contact === "116 123")).toBe(true);
  });

  it("fails if any rule or locale text contains 'confidential', '24/7' or 'always available'", () => {
    const forbiddenPatterns = ["confidential", "24/7", "always available"];

    // Check all rules
    for (const rule of RULES) {
      const ruleText = [
        rule.label,
        ...rule.reasons,
        ...rule.nextSteps,
        ...rule.warningSigns,
      ].join(" ").toLowerCase();

      for (const pattern of forbiddenPatterns) {
        expect(
          ruleText.includes(pattern),
          `Rule "${rule.id}" contains forbidden claim "${pattern}"`,
        ).toBe(false);
      }
    }

    // Check all locales
    const allLocales = [DEFAULT_LOCALE, US_LOCALE, UK_LOCALE];
    for (const locale of allLocales) {
      const localeText = JSON.stringify(locale).toLowerCase();
      for (const pattern of forbiddenPatterns) {
        expect(
          localeText.includes(pattern),
          `Locale config contains forbidden claim "${pattern}"`,
        ).toBe(false);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  4 · hasMatch semantics & normalization edge cases
// ═══════════════════════════════════════════════════════════════════════════

describe("hasMatch semantics", () => {
  it("returns hasMatch: true when a rule fires", () => {
    expect(run("I have chest pain").hasMatch).toBe(true);
  });

  it("returns hasMatch: false when nothing matches and confirms property exists", () => {
    const r = run("My elbow feels slightly stiff");
    expect(r).toHaveProperty("hasMatch");
    expect(r.hasMatch).toBe(false);
    expect(r.urgency).toBeUndefined();
    expect(r.matches).toHaveLength(0);
  });

  it("always includes a safety disclaimer", () => {
    expect(run("anything").disclaimer).toContain("guidance only, not a medical diagnosis");
    expect(run("chest pain").disclaimer).toContain("emergency number immediately");
  });

  it("matches curly apostrophes ('can’t breathe') like straight ones", () => {
    const r = run("I can’t breathe");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("I can’t breathe")).toContain("breathing-emergency");
  });

  it("handles uppercase and extra whitespace gracefully", () => {
    const r = run("    CHEST    PAIN    ");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("    CHEST    PAIN    ")).toContain("chest-pain");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  5 · Word boundary matching (heartburn != burn)
// ═══════════════════════════════════════════════════════════════════════════

describe("word boundary matching", () => {
  it("'heartburn' must NOT trigger the burn rule", () => {
    const ids = matchedIds("I have severe heartburn after eating spicy food");
    expect(ids).not.toContain("burn");
  });

  it("'burn' matches standalone word", () => {
    const ids = matchedIds("I have a burn on my hand from boiling water");
    expect(ids).toContain("burn");
  });

  it("containsPhrase helper tests boundaries correctly", () => {
    expect(containsPhrase("heartburn", "burn")).toBe(false);
    expect(containsPhrase("a burn injury", "burn")).toBe(true);
    expect(containsPhrase("burned my finger", "burned")).toBe(true);
  });

  it("normalise function expands phrase synonyms with word boundaries", () => {
    expect(normalise("I have a high temp")).toContain("fever");
    expect(normalise("he blacked out")).toContain("loss of consciousness");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  6 · Hives vs Anaphylaxis & Urgency level 'see-clinician'
// ═══════════════════════════════════════════════════════════════════════════

describe("anaphylaxis vs hives-alone", () => {
  it("hives ALONE triggers hives-alone with urgency 'see-clinician'", () => {
    const r = run("I have itchy hives on my arms");
    expect(r.urgency).toBe("see-clinician");
    expect(matchedIds("I have itchy hives on my arms")).toEqual(["hives-alone"]);
  });

  it("hives-alone gets see-clinician, not emergency", () => {
    const r = run("I have hives");
    const hivesMatch = r.matches.find((m) => m.rule.id === "hives-alone");
    expect(hivesMatch).toBeDefined();
    expect(hivesMatch!.rule.urgency).toBe("see-clinician");
  });

  it("hives ALONE does not trigger anaphylaxis", () => {
    const ids = matchedIds("I have hives");
    expect(ids).not.toContain("anaphylaxis");
  });

  it("hives + difficulty breathing triggers anaphylaxis [emergency]", () => {
    const r = run("I have hives and I can't breathe");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("I have hives and I can't breathe")).toContain("anaphylaxis");
  });

  it("hives + throat swelling triggers anaphylaxis [emergency]", () => {
    const ids = matchedIds("I have hives and my throat is swelling");
    expect(ids).toContain("anaphylaxis");
  });

  it("hives + face swelling triggers anaphylaxis [emergency]", () => {
    const ids = matchedIds("I have hives and my lips are swollen");
    expect(ids).toContain("anaphylaxis");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  7 · Fainting vs Unresponsiveness
// ═══════════════════════════════════════════════════════════════════════════

describe("fainting vs unresponsiveness", () => {
  it("'fainted' triggers fainting [urgent], not unresponsive", () => {
    const r = run("I fainted briefly in the kitchen");
    expect(r.urgency).toBe("urgent");
    expect(matchedIds("I fainted briefly in the kitchen")).toContain("fainting");
    expect(matchedIds("I fainted briefly in the kitchen")).not.toContain("unresponsive");
  });

  it("fainting is urgent, not emergency", () => {
    const r = run("I fainted");
    const faintMatch = r.matches.find((m) => m.rule.id === "fainting");
    expect(faintMatch).toBeDefined();
    expect(faintMatch!.rule.urgency).toBe("urgent");
  });

  it("'unconscious' triggers unresponsive [emergency], not fainting", () => {
    const r = run("the patient is unconscious");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("the patient is unconscious")).toContain("unresponsive");
    expect(matchedIds("the patient is unconscious")).not.toContain("fainting");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  8 · Infant fever & ageRange fallback
// ═══════════════════════════════════════════════════════════════════════════

describe("infant fever rules", () => {
  it("fever in a 1-month-old is emergency", () => {
    const r = run("my baby has a fever", { ageMonths: 1 });
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("my baby has a fever", { ageMonths: 1 })).toContain(
      "infant-fever-under-3m",
    );
  });

  it("fever in a 2-month-old is emergency (under 3m bucket)", () => {
    const r = run("my baby has a high temperature", { ageMonths: 2 });
    expect(matchedIds("fever", { ageMonths: 2 })).toContain(
      "infant-fever-under-3m",
    );
    expect(r.urgency).toBe("emergency");
  });

  it("fever in a 6-month-old triggers 3-12m urgent rule", () => {
    const r = run("my baby has a fever", { ageMonths: 6 });
    expect(r.urgency).toBe("urgent");
    const ids = matchedIds("my baby has a fever", { ageMonths: 6 });
    expect(ids).toContain("infant-fever-3-12m");
    expect(ids).not.toContain("infant-fever-under-3m");
  });

  it("if ageRange is 'infant' and ageMonths is missing, applies stricter under-3m rule", () => {
    const r = run("my baby has a fever", { ageRange: "infant" });
    expect(r.urgency).toBe("emergency");
    const ids = matchedIds("my baby has a fever", { ageRange: "infant" });
    expect(ids).toContain("infant-fever-under-3m");
    expect(ids).not.toContain("infant-fever-3-12m");
  });

  it("fever without age does not trigger infant rules", () => {
    const ids = matchedIds("I have a fever");
    expect(ids).not.toContain("infant-fever-under-3m");
    expect(ids).not.toContain("infant-fever-3-12m");
  });

  it("fever in a 24-month-old does not trigger infant rules", () => {
    const ids = matchedIds("fever", { ageMonths: 24 });
    expect(ids).not.toContain("infant-fever-under-3m");
    expect(ids).not.toContain("infant-fever-3-12m");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  9 · Severity floor & older-adult fever
// ═══════════════════════════════════════════════════════════════════════════

describe("severity floor & older-adult fever", () => {
  it("severity 5 with no other match gives at least 'urgent'", () => {
    const r = run("My toe is sore", { severity: 5 });
    expect(r.hasMatch).toBe(true);
    expect(r.urgency).toBe("urgent");
    expect(r.matches.map((m) => m.rule.id)).toContain("high-severity-unmatched");
  });

  it("severity 5 + hives gives 'urgent' (fires alongside see-clinician)", () => {
    const r = run("I have hives", { severity: 5 });
    expect(r.urgency).toBe("urgent");
    const ids = r.matches.map((m) => m.rule.id);
    expect(ids).toContain("hives-alone");
    expect(ids).toContain("high-severity-unmatched");
  });

  it("negative test: severity 3 with no other match does not trigger catch-all", () => {
    const r = run("My toe is sore", { severity: 3 });
    expect(r.hasMatch).toBe(false);
    expect(r.urgency).toBeUndefined();
  });

  it("older-adult fever with severity >= 4 gives 'urgent'", () => {
    const r = run("grandmother has a high temperature", {
      ageRange: "older-adult",
      severity: 4,
    });
    expect(r.urgency).toBe("urgent");
    expect(r.matches.map((m) => m.rule.id)).toContain("older-adult-fever");
  });

  it("negative test: older-adult fever with severity < 4 does not trigger older-adult-fever", () => {
    const ids = matchedIds("grandmother has a high temperature", {
      ageRange: "older-adult",
      severity: 2,
    });
    expect(ids).not.toContain("older-adult-fever");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 10 · Stroke signs gates (emergency vs urgent)
// ═══════════════════════════════════════════════════════════════════════════

describe("stroke signs gates", () => {
  it("facial drooping alone gives emergency", () => {
    const r = run("my face is drooping");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("my face is drooping")).toContain("stroke-signs");
  });

  it("slurred speech alone gives emergency", () => {
    const r = run("his speech is slurred");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("his speech is slurred")).toContain("stroke-signs");
  });

  it("sudden weakness gives emergency", () => {
    const r = run("sudden weakness in my left arm");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("sudden weakness in my left arm")).toContain("stroke-signs");
  });

  it("sudden trouble walking gives emergency", () => {
    const r = run("all of a sudden trouble walking");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("all of a sudden trouble walking")).toContain("stroke-signs");
  });

  it("sudden vision loss gives emergency", () => {
    const r = run("sudden loss of vision in right eye");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("sudden loss of vision in right eye")).toContain("stroke-signs");
  });

  it("2+ stroke signs together give emergency (e.g. weak arm and trouble walking)", () => {
    const r = run("weakness in arm and difficulty walking");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("weakness in arm and difficulty walking")).toContain("stroke-signs");
  });

  it("negative gate: 'twisted ankle, trouble walking' is NOT emergency (gives urgent)", () => {
    const r = run("twisted ankle, trouble walking");
    expect(r.urgency).toBe("urgent");
    expect(matchedIds("twisted ankle, trouble walking")).not.toContain("stroke-signs");
    expect(matchedIds("twisted ankle, trouble walking")).toContain("neurological-deficit");
  });

  it("negative gate: isolated vision loss without sudden is NOT emergency (gives urgent)", () => {
    const r = run("gradual vision loss over three months");
    expect(r.urgency).toBe("urgent");
    expect(matchedIds("gradual vision loss over three months")).not.toContain("stroke-signs");
    expect(matchedIds("gradual vision loss over three months")).toContain("neurological-deficit");
  });

  it("negative gate: isolated arm weakness without sudden is NOT emergency (gives urgent)", () => {
    const r = run("weakness in arm after painting fence");
    expect(r.urgency).toBe("urgent");
    expect(matchedIds("weakness in arm after painting fence")).not.toContain("stroke-signs");
    expect(matchedIds("weakness in arm after painting fence")).toContain("neurological-deficit");
  });

  it("'I suddenly lost vision in one eye' -> emergency", () => {
    const r = run("I suddenly lost vision in one eye");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("I suddenly lost vision in one eye")).toContain("stroke-signs");
  });

  it("'suddenly my arm is weak' -> emergency", () => {
    const r = run("suddenly my arm is weak");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("suddenly my arm is weak")).toContain("stroke-signs");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 11 · Sudden severe headache gates
// ═══════════════════════════════════════════════════════════════════════════

describe("sudden-severe-headache gates", () => {
  it("worst headache gives emergency", () => {
    const r = run("worst headache of my life");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("worst headache of my life")).toContain("sudden-severe-headache");
  });

  it("thunderclap gives emergency", () => {
    const r = run("I have a thunderclap headache");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("I have a thunderclap headache")).toContain("sudden-severe-headache");
  });

  it("'sudden' with 'severe' gives emergency", () => {
    const r = run("headache came on suddenly and is severe");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("headache came on suddenly and is severe")).toContain(
      "sudden-severe-headache",
    );
  });

  it("negative gate: plain 'severe headache' without sudden/worst/thunderclap gives urgent", () => {
    const r = run("I have a severe headache that started this morning");
    expect(r.urgency).toBe("urgent");
    expect(
      matchedIds("I have a severe headache that started this morning"),
    ).not.toContain("sudden-severe-headache");
    expect(
      matchedIds("I have a severe headache that started this morning"),
    ).toContain("severe-headache");
  });

  it("negative gate: 'sudden headache' without severe/worst/thunderclap does not trigger emergency headache", () => {
    const ids = matchedIds("I got a sudden headache");
    expect(ids).not.toContain("sudden-severe-headache");
  });

  it("'I suddenly have a severe headache' -> emergency", () => {
    const r = run("I suddenly have a severe headache");
    expect(r.urgency).toBe("emergency");
    expect(matchedIds("I suddenly have a severe headache")).toContain("sudden-severe-headache");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 12 · Crisis rules (suicidal-thoughts, self-harm)
// ═══════════════════════════════════════════════════════════════════════════

describe("crisis rules category & guidance requirements", () => {
  it("both suicidal-thoughts and self-harm have category: 'crisis'", () => {
    const suicideRule = RULES.find((r) => r.id === "suicidal-thoughts");
    const selfHarmRule = RULES.find((r) => r.id === "self-harm");
    expect(suicideRule?.category).toBe("crisis");
    expect(selfHarmRule?.category).toBe("crisis");
  });

  it("suicidal-thoughts nextSteps contain mandatory safety guidance", () => {
    const rule = RULES.find((r) => r.id === "suicidal-thoughts")!;
    expect(rule.nextSteps).toContain(
      "If you are in immediate danger, contact your local emergency number now.",
    );
    expect(rule.nextSteps).toContain(
      "If you can, avoid being alone right now.",
    );
  });

  it("self-harm nextSteps contain mandatory safety guidance", () => {
    const rule = RULES.find((r) => r.id === "self-harm")!;
    expect(rule.nextSteps).toContain(
      "If you are in immediate danger, contact your local emergency number now.",
    );
    expect(rule.nextSteps).toContain(
      "If you can, avoid being alone right now.",
    );
  });

  it("crisis rules remove claims about confidentiality or availability", () => {
    for (const ruleId of ["suicidal-thoughts", "self-harm"]) {
      const rule = RULES.find((r) => r.id === ruleId)!;
      const combined = [...rule.reasons, ...rule.nextSteps, ...rule.warningSigns].join(" ").toLowerCase();
      expect(combined).not.toContain("confidential");
      expect(combined).not.toContain("available right now");
      expect(combined).not.toContain("whenever you need it");
      expect(combined).not.toContain("24/7");
    }
  });

  it("crisis phrase 'I want to kill myself' -> suicidal-thoughts", () => {
    expect(matchedIds("I want to kill myself")).toContain("suicidal-thoughts");
  });

  it("crisis phrase 'I want to end my life' -> suicidal-thoughts", () => {
    expect(matchedIds("I want to end my life")).toContain("suicidal-thoughts");
  });

  it("crisis phrase 'I don't want to live anymore' -> suicidal-thoughts", () => {
    expect(matchedIds("I don't want to live anymore")).toContain("suicidal-thoughts");
  });

  it("crisis phrase 'I've been cutting myself' -> self-harm", () => {
    expect(matchedIds("I've been cutting myself")).toContain("self-harm");
  });

  it("crisis phrase 'thinking of hurting myself' -> self-harm", () => {
    expect(matchedIds("thinking of hurting myself")).toContain("self-harm");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 13 · Restored clinical & phrase matching tests
// ═══════════════════════════════════════════════════════════════════════════

describe("restored clinical and synonym tests", () => {
  it("matches chest pain", () => {
    expect(matchedIds("I have chest pain")).toContain("chest-pain");
  });

  it("matches chest tightness (synonym)", () => {
    expect(matchedIds("feeling chest tightness")).toContain("chest-pain");
  });

  it("matches difficulty breathing", () => {
    expect(matchedIds("I can't breathe")).toContain("breathing-emergency");
  });

  it("matches choking", () => {
    expect(matchedIds("the child is choking")).toContain("choking");
  });

  it("matches stroke signs – facial drooping", () => {
    expect(matchedIds("my face is drooping")).toContain("stroke-signs");
  });

  it("matches stroke signs – slurred speech", () => {
    expect(matchedIds("his speech is slurred")).toContain("stroke-signs");
  });

  it("matches unresponsive person", () => {
    expect(matchedIds("the person is unconscious")).toContain("unresponsive");
  });

  it("matches severe bleeding", () => {
    expect(matchedIds("heavy bleeding from the wound")).toContain("severe-bleeding");
  });

  it("matches seizure", () => {
    expect(matchedIds("my child is having a seizure")).toContain("seizure");
  });

  it("matches convulsion (synonym for seizure)", () => {
    expect(matchedIds("she is having convulsions")).toContain("seizure");
  });

  it("matches poisoning", () => {
    expect(matchedIds("my toddler swallowed poison")).toContain("poisoning-overdose");
  });

  it("matches overdose", () => {
    expect(matchedIds("I think I took too many pills")).toContain("poisoning-overdose");
  });

  it("matches sudden severe headache", () => {
    expect(matchedIds("I have the worst headache of my life")).toContain(
      "sudden-severe-headache",
    );
  });

  it("matches thunderclap headache (synonym)", () => {
    expect(matchedIds("thunderclap headache")).toContain("sudden-severe-headache");
  });

  it("matches suicidal thoughts", () => {
    expect(matchedIds("I want to kill myself")).toContain("suicidal-thoughts");
  });

  it("matches suicidal ideation phrasing", () => {
    expect(matchedIds("I don't want to live anymore")).toContain("suicidal-thoughts");
  });

  it("matches self-harm", () => {
    expect(matchedIds("I have been cutting myself")).toContain("self-harm");
  });

  it("matches burn", () => {
    expect(matchedIds("I burned my hand on the stove")).toContain("burn");
  });

  it("matches head injury", () => {
    expect(matchedIds("I hit my head really hard")).toContain("head-injury");
  });

  it("matches bulging fontanelle for infant", () => {
    expect(
      matchedIds("the baby's soft spot is bulging", { ageMonths: 4 }),
    ).toContain("bulging-fontanelle");
  });

  it("bulging fontanelle does not match without appropriate age", () => {
    expect(
      matchedIds("fontanelle bulging", { ageMonths: 24 }),
    ).not.toContain("bulging-fontanelle");
  });

  it("matches infant not feeding", () => {
    expect(
      matchedIds("the baby is not feeding", { ageMonths: 2 }),
    ).toContain("infant-not-feeding");
  });

  it("'can\\'t breathe' normalises to 'difficulty breathing'", () => {
    expect(normalise("I can't breathe")).toContain("difficulty breathing");
  });

  it("'shortness of breath' normalises to 'difficulty breathing'", () => {
    expect(normalise("I have shortness of breath")).toContain("difficulty breathing");
  });

  it("'passed out' normalises to 'loss of consciousness'", () => {
    expect(normalise("he passed out")).toContain("loss of consciousness");
  });

  it("'want to die' normalises to 'suicidal thoughts'", () => {
    expect(normalise("I want to die")).toContain("suicidal thoughts");
  });

  it("matches multi-word phrases in freeText", () => {
    expect(
      matchedIds("I am experiencing severe bleeding from a cut"),
    ).toContain("severe-bleeding");
  });

  it("matches phrases supplied via symptoms array", () => {
    expect(
      matchedIds("I feel unwell", { symptoms: ["chest pain"] }),
    ).toContain("chest-pain");
  });

  it("'pain' alone does not trigger chest-pain", () => {
    expect(matchedIds("I have pain in my knee")).not.toContain("chest-pain");
  });

  it("overall urgency equals the most critical match", () => {
    const r = run("I have chest pain and hives");
    expect(r.urgency).toBe("emergency");
    expect(r.matches[0].rule.urgency).toBe("emergency");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 14 · Known limitations (negation over-escalation)
// ═══════════════════════════════════════════════════════════════════════════

describe("known limitations", () => {
  it("documents negation over-escalation: 'no chest pain' still triggers chest-pain", () => {
    const ids = matchedIds("I have no chest pain");
    expect(ids).toContain("chest-pain");
  });
});
