// ---------------------------------------------------------------------------
// Triage engine – phrase synonyms / expansions
// ---------------------------------------------------------------------------
// Each key is the *canonical* phrase used in rules.  The value array lists
// alternative phrasings users might type.  During normalisation the engine
// expands user input so that canonical phrases appear in the text.
//
// Everything is lowercase; the normaliser lowercases input before matching.
// Word boundaries are preserved so "burn" will not match "heartburn".
// ---------------------------------------------------------------------------

export const SYNONYMS: Record<string, string[]> = {
  // ── cardiac / circulatory ──────────────────────────────────────────
  "chest pain": [
    "chest tightness",
    "chest pressure",
    "pain in chest",
    "pain in my chest",
    "squeezing in chest",
  ],
  "heart attack": ["cardiac arrest", "mi", "myocardial infarction"],

  // ── respiratory ────────────────────────────────────────────────────
  "difficulty breathing": [
    "hard to breathe",
    "can't breathe",
    "cant breathe",
    "trouble breathing",
    "shortness of breath",
    "short of breath",
    "breathing difficulty",
    "struggling to breathe",
    "labored breathing",
    "laboured breathing",
  ],
  choking: [
    "choked",
    "airway blocked",
    "something stuck in throat",
    "can't swallow",
    "cant swallow",
  ],

  // ── neurological & stroke ──────────────────────────────────────────
  thunderclap: ["thunderclap headache"],
  "worst headache": [
    "worst headache of my life",
    "worst headache I've ever had",
    "worst headache ive ever had",
  ],
  "severe headache": [
    "intense headache",
    "extreme headache",
    "very bad headache",
    "splitting headache",
  ],
  sudden: [
    "suddenly",
    "all of a sudden",
    "out of nowhere",
    "abruptly",
    "woke up with",
    "came on fast",
    "came on suddenly",
  ],
  seizure: [
    "convulsion",
    "convulsions",
    "fitting",
    "having a fit",
    "seizures",
  ],
  "loss of consciousness": [
    "passed out",
    "blacked out",
    "unresponsive",
    "not responding",
    "unconscious",
  ],
  fainted: ["faint", "fainting", "felt faint", "nearly fainted"],
  "slurred speech": [
    "speech is slurred",
    "words are slurred",
    "slurring words",
    "slurring speech",
    "talking funny",
  ],
  "facial drooping": [
    "face drooping",
    "face is drooping",
    "droopy face",
    "drooping face",
    "one side of face is drooping",
  ],
  "sudden confusion": [
    "suddenly confused",
    "confused suddenly",
    "acute confusion",
  ],
  numbness: [
    "numb on one side",
    "numb feeling",
    "loss of sensation",
  ],
  "arm weakness": ["weakness in arm", "weak arm", "arm is weak"],
  "leg weakness": ["weakness in leg", "weak leg", "leg is weak"],
  "one-sided weakness": [
    "weakness on one side",
    "weak on one side",
    "one side is weak",
    "one side weakness",
    "hemiparesis",
  ],
  weakness: ["loss of strength", "feeling weak in limb"],
  "vision loss": [
    "lost vision",
    "loss of vision",
    "can't see in one eye",
    "trouble seeing",
  ],
  "trouble walking": [
    "cannot walk",
    "difficulty walking",
    "unsteady on feet",
    "unable to walk",
  ],

  // ── allergic / anaphylaxis ─────────────────────────────────────────
  hives: ["welts", "urticaria", "itchy bumps"],
  "throat swelling": [
    "swollen throat",
    "throat is swelling",
    "throat closing",
    "throat tightening",
  ],
  "face swelling": [
    "swollen face",
    "face is swelling",
    "lips swelling",
    "swollen lips",
    "lips are swollen",
    "tongue swelling",
    "swollen tongue",
  ],

  // ── bleeding / trauma ──────────────────────────────────────────────
  "severe bleeding": [
    "heavy bleeding",
    "won't stop bleeding",
    "uncontrolled bleeding",
    "bleeding heavily",
    "profuse bleeding",
  ],
  "head injury": ["hit my head", "hit head", "head trauma", "head wound"],
  burn: ["burned", "burnt", "scalded", "scald"],

  // ── GI / bleeding ───────────────────────────────────────────────────
  "vomiting blood": [
    "throwing up blood",
    "threw up blood",
    "vomited blood",
    "blood in vomit",
  ],
  "coughing blood": [
    "coughed up blood",
    "blood when coughing",
    "coughing up blood",
    "cough blood",
  ],

  // ── abdominal ──────────────────────────────────────────────────────
  "severe abdominal pain": [
    "severe stomach pain",
    "intense abdominal pain",
    "intense stomach pain",
    "worst stomach pain",
    "agonizing stomach pain",
    "agonising stomach pain",
    "severe belly pain",
  ],

  // ── fever & infection ──────────────────────────────────────────────
  fever: [
    "high temperature",
    "high temp",
    "febrile",
    "feverish",
    "running a fever",
    "high fever",
  ],
  "stiff neck": [
    "neck stiffness",
    "neck is stiff",
    "my neck is stiff",
    "cannot bend neck",
    "rigid neck",
  ],

  // ── poisoning / overdose ───────────────────────────────────────────
  poisoning: [
    "poisoned",
    "ingested poison",
    "swallowed poison",
    "drank poison",
    "ate poison",
  ],
  overdose: [
    "overdosed",
    "took too many pills",
    "too many pills",
    "drug overdose",
    "medication overdose",
    "took too much",
  ],

  // ── mental health ──────────────────────────────────────────────────
  "suicidal thoughts": [
    "want to kill myself",
    "thinking about suicide",
    "suicidal",
    "want to die",
    "wish i was dead",
    "wish i were dead",
    "end my life",
    "want to end my life",
    "end it all",
    "don't want to live",
    "dont want to live",
    "don't want to live anymore",
    "dont want to live anymore",
  ],
  "self-harm": [
    "self harm",
    "cutting myself",
    "i've been cutting myself",
    "ive been cutting myself",
    "hurting myself",
    "thinking of hurting myself",
    "harming myself",
    "want to hurt myself",
  ],

  // ── diabetic / metabolic ───────────────────────────────────────────
  diabetic: ["diabetes", "type 1 diabetes", "type 2 diabetes", "diabetic person"],
  "low blood sugar": [
    "hypoglycemia",
    "hypoglycaemia",
    "blood sugar is low",
    "blood sugar very low",
    "sugar is low",
    "blood sugar crashed",
  ],

  // ── pregnancy ──────────────────────────────────────────────────────
  pregnant: ["pregnancy", "weeks pregnant", "months pregnant", "expecting a baby"],

  // ── paediatric ─────────────────────────────────────────────────────
  "not feeding": ["refusing to eat", "won't eat", "wont eat", "not eating"],
  "bulging fontanelle": [
    "fontanelle bulging",
    "soft spot bulging",
    "soft spot is bulging",
  ],
};
