// ---------------------------------------------------------------------------
// Triage engine – structural test cases for all rules
// ---------------------------------------------------------------------------
// Every rule in RULES must have exactly one positive and one negative case here.
// A meta-test verifies full coverage over all rule IDs.
// ---------------------------------------------------------------------------

import type { TriageInput } from "../types";

export interface RuleCase {
  ruleId: string;
  positive: TriageInput;
  negative: TriageInput;
}

export const RULE_CASES: RuleCase[] = [
  // ── Emergency rules ────────────────────────────────────────────────
  {
    ruleId: "chest-pain",
    positive: { freeText: "I am having chest pain" },
    negative: { freeText: "I have a sore ankle from running" },
  },
  {
    ruleId: "breathing-emergency",
    positive: { freeText: "I am having difficulty breathing" },
    negative: { freeText: "sneezing slightly from dust" },
  },
  {
    ruleId: "choking",
    positive: { freeText: "the child is choking on food" },
    negative: { freeText: "coughing normally with a glass of water" },
  },
  {
    ruleId: "anaphylaxis",
    positive: { freeText: "I have hives and my throat is swelling" },
    negative: { freeText: "I have itchy hives alone on my arm" },
  },
  {
    ruleId: "stroke-signs",
    positive: { freeText: "face is drooping and slurred speech" },
    negative: { freeText: "twisted ankle, trouble walking" },
  },
  {
    ruleId: "unresponsive",
    positive: { freeText: "the person is unresponsive and unconscious" },
    negative: { freeText: "person is awake and speaking clearly" },
  },
  {
    ruleId: "severe-bleeding",
    positive: { freeText: "heavy bleeding from a deep wound" },
    negative: { freeText: "small paper cut on my finger" },
  },
  {
    ruleId: "seizure",
    positive: { freeText: "she is having active convulsions" },
    negative: { freeText: "muscle twitching in calf after gym" },
  },
  {
    ruleId: "poisoning-overdose",
    positive: { freeText: "accidentally swallowed poison from bottle" },
    negative: { freeText: "took daily multivitamin with breakfast" },
  },
  {
    ruleId: "sudden-severe-headache",
    positive: { freeText: "worst headache of my life, came on suddenly like thunderclap" },
    negative: { freeText: "severe headache that started yesterday" },
  },
  {
    ruleId: "vomiting-coughing-blood",
    positive: { freeText: "I am throwing up blood" },
    negative: { freeText: "nausea after eating too much lunch" },
  },
  {
    ruleId: "fever-stiff-neck",
    positive: { freeText: "I have a high fever and a stiff neck" },
    negative: { freeText: "my neck is stiff from sleeping awkwardly without a pillow" },
  },
  {
    ruleId: "pregnancy-emergency",
    positive: { freeText: "I am 10 weeks pregnant and have heavy bleeding" },
    negative: { freeText: "I am pregnant and have mild morning sickness" },
  },
  {
    ruleId: "diabetic-emergency",
    positive: { freeText: "he is diabetic and has very low blood sugar" },
    negative: { freeText: "she has diabetes and blood sugar is normal" },
  },
  {
    ruleId: "infant-fever-under-3m",
    positive: { freeText: "my baby has a fever", ageMonths: 1 },
    negative: { freeText: "my child has a fever", ageMonths: 36 },
  },
  {
    ruleId: "bulging-fontanelle",
    positive: { freeText: "baby soft spot is bulging", ageMonths: 4 },
    negative: { freeText: "adult with a sore scalp" },
  },
  {
    ruleId: "suicidal-thoughts",
    positive: { freeText: "I am experiencing suicidal thoughts" },
    negative: { freeText: "feeling stressed about my job interview" },
  },
  {
    ruleId: "self-harm",
    positive: { freeText: "I have been cutting myself to cope" },
    negative: { freeText: "scratched arm on a rose bush" },
  },

  // ── Urgent rules ───────────────────────────────────────────────────
  {
    ruleId: "severe-headache",
    positive: { freeText: "I have a severe headache" },
    negative: { freeText: "mild ache behind my eyes" },
  },
  {
    ruleId: "neurological-deficit",
    positive: { freeText: "twisted ankle, trouble walking" },
    negative: { freeText: "mild ache in my shoulder" },
  },
  {
    ruleId: "fainting",
    positive: { freeText: "I fainted when getting out of bed" },
    negative: { freeText: "felt slightly drowsy in the afternoon" },
  },
  {
    ruleId: "head-injury",
    positive: { freeText: "hit my head hard on the door frame" },
    negative: { freeText: "bumped my elbow against the door" },
  },
  {
    ruleId: "burn",
    positive: { freeText: "scalded my hand with boiling water" },
    negative: { freeText: "mild heartburn after spicy tacos" },
  },
  {
    ruleId: "infant-fever-3-12m",
    positive: { freeText: "infant has a fever", ageMonths: 6 },
    negative: { freeText: "infant has a fever", ageMonths: 1 },
  },
  {
    ruleId: "infant-not-feeding",
    positive: { freeText: "baby is refusing to eat", ageMonths: 2 },
    negative: { freeText: "baby is feeding enthusiastically", ageMonths: 2 },
  },
  {
    ruleId: "severe-abdominal-pain",
    positive: { freeText: "experiencing severe abdominal pain" },
    negative: { freeText: "mild stomach rumbling after meal" },
  },
  {
    ruleId: "older-adult-fever",
    positive: { freeText: "grandmother has a fever", ageRange: "older-adult", severity: 4 },
    negative: { freeText: "grandmother has a fever", ageRange: "older-adult", severity: 2 },
  },
  {
    ruleId: "high-severity-unmatched",
    positive: { freeText: "unexplained pain in joint", severity: 5 },
    negative: { freeText: "unexplained pain in joint", severity: 2 },
  },

  // ── See-clinician rules ────────────────────────────────────────────
  {
    ruleId: "hives-alone",
    positive: { freeText: "itchy hives all over my arms" },
    negative: { freeText: "dry skin on my hands" },
  },
];
