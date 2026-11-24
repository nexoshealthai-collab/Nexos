// ---------------------------------------------------------------------------
// Triage engine – declarative rules
// ---------------------------------------------------------------------------
// Every rule has an *explicit* urgency.  The generic matcher in engine.ts
// evaluates `anyOf`, `allOf`, `anyOfAll`, `ageRange`, and `minSeverity`
// against normalised input – no per-rule functions.
//
// All user-facing strings provide *guidance*, never a diagnosis.
// Country-specific phone numbers live in config.ts, NOT here.
// ---------------------------------------------------------------------------

import type { TriageRule } from "./types";

export const RULES: TriageRule[] = [
  // ═══════════════════════════════════════════════════════════════════
  //  EMERGENCY (18 rules)
  // ═══════════════════════════════════════════════════════════════════

  // ── 1. Cardiac ─────────────────────────────────────────────────────
  {
    id: "chest-pain",
    label: "Possible cardiac concern",
    urgency: "emergency",
    anyOf: ["chest pain", "heart attack"],
    reasons: [
      "Symptoms involving the heart or chest may indicate an emergency.",
    ],
    nextSteps: [
      "Call your local emergency number immediately.",
      "Chew an aspirin if not allergic and immediately available.",
      "Do not drive yourself to the hospital.",
    ],
    warningSigns: [
      "Pain spreading to the arm, neck, jaw, or back.",
      "Cold sweats, nausea, or lightheadedness.",
    ],
    reviewed: false,
  },

  // ── 2. Breathing difficulty ────────────────────────────────────────
  {
    id: "breathing-emergency",
    label: "Breathing difficulty",
    urgency: "emergency",
    anyOf: ["difficulty breathing"],
    reasons: [
      "Severe trouble breathing can lead to oxygen deprivation and requires immediate medical attention.",
    ],
    nextSteps: [
      "Call your local emergency number immediately.",
      "Sit upright in a comfortable position to ease breathing.",
      "Loosen tight clothing around the neck and chest.",
    ],
    warningSigns: [
      "Lips, tongue, or fingertips turning blue or grey.",
      "Inability to speak in complete sentences.",
    ],
    reviewed: false,
  },

  // ── 3. Choking ─────────────────────────────────────────────────────
  {
    id: "choking",
    label: "Choking",
    urgency: "emergency",
    anyOf: ["choking"],
    reasons: [
      "An obstructed airway prevents normal breathing and is an immediate emergency.",
    ],
    nextSteps: [
      "Call your local emergency number immediately.",
      "If the person can cough, encourage forceful coughing.",
      "If unable to cough or breathe, perform back blows and abdominal thrusts (Heimlich manoeuvre).",
    ],
    warningSigns: [
      "Inability to speak, cry, or cough.",
      "Skin turning blue or loss of consciousness.",
    ],
    reviewed: false,
  },

  // ── 4. Anaphylaxis ─────────────────────────────────────────────────
  {
    id: "anaphylaxis",
    label: "Possible severe allergic reaction",
    urgency: "emergency",
    allOf: ["hives"],
    anyOf: ["difficulty breathing", "throat swelling", "face swelling"],
    reasons: [
      "Hives paired with airway constriction or facial swelling indicates a potential severe systemic reaction.",
    ],
    nextSteps: [
      "Call your local emergency number immediately.",
      "Use an epinephrine auto-injector (EpiPen) if prescribed and available.",
      "Lie down with legs elevated unless breathing is easier sitting up.",
    ],
    warningSigns: [
      "Rapid swelling of the tongue, lips, or throat.",
      "Dizziness, confusion, or collapse.",
    ],
    reviewed: false,
  },

  // ── 5. Stroke signs ────────────────────────────────────────────────
  // Facial drooping and slurred speech are emergency alone.
  // Weakness, trouble walking and vision loss are emergency only with "sudden"
  // or when 2+ stroke signs appear together; otherwise they give "urgent".
  {
    id: "stroke-signs",
    label: "Possible stroke signs",
    urgency: "emergency",
    anyOfAll: [
      ["facial drooping"],
      ["slurred speech"],
      ["sudden", "arm weakness"],
      ["sudden", "leg weakness"],
      ["sudden", "one-sided weakness"],
      ["sudden", "weakness"],
      ["sudden", "trouble walking"],
      ["sudden", "vision loss"],
      ["sudden", "numbness"],
      // 2+ stroke signs combined
      ["arm weakness", "leg weakness"],
      ["arm weakness", "trouble walking"],
      ["leg weakness", "trouble walking"],
      ["arm weakness", "vision loss"],
      ["leg weakness", "vision loss"],
      ["one-sided weakness", "trouble walking"],
      ["one-sided weakness", "vision loss"],
      ["weakness", "trouble walking"],
      ["weakness", "vision loss"],
      ["trouble walking", "vision loss"],
    ],
    reasons: [
      "Sudden neurological changes may indicate a stroke requiring immediate specialist care.",
    ],
    nextSteps: [
      "Call your local emergency number immediately.",
      "Note the exact time symptoms first appeared.",
      "Do not give any food, liquids, or medication.",
    ],
    warningSigns: [
      "Sudden loss of vision or double vision.",
      "Sudden severe headache with no clear cause.",
      "Loss of balance or coordination.",
    ],
    reviewed: false,
  },

  // ── 6. Unresponsiveness ────────────────────────────────────────────
  {
    id: "unresponsive",
    label: "Unresponsive or unconscious",
    urgency: "emergency",
    anyOf: ["loss of consciousness"],
    reasons: [
      "A person who cannot be awakened or does not respond needs immediate medical intervention.",
    ],
    nextSteps: [
      "Call your local emergency number immediately.",
      "Check if the person is breathing; start CPR if breathing is absent and you are trained.",
      "If breathing normally, place them in the recovery position on their side.",
    ],
    warningSigns: [
      "No breathing or only agonal gasping.",
      "Lack of detectable pulse.",
    ],
    reviewed: false,
  },

  // ── 7. Severe bleeding ─────────────────────────────────────────────
  {
    id: "severe-bleeding",
    label: "Severe or uncontrolled bleeding",
    urgency: "emergency",
    anyOf: ["severe bleeding"],
    reasons: [
      "Rapid blood loss can lead to hypovolemic shock and life-threatening complications.",
    ],
    nextSteps: [
      "Apply firm, direct pressure to the wound with a clean cloth or bandage.",
      "Call your local emergency number if bleeding does not stop after direct pressure.",
      "Do not remove embedded objects from a deep wound.",
    ],
    warningSigns: [
      "Blood soaking through multiple dressings quickly.",
      "Pale, cold, clammy skin and confusion.",
    ],
    reviewed: false,
  },

  // ── 8. Seizure ─────────────────────────────────────────────────────
  {
    id: "seizure",
    label: "Seizure or convulsion",
    urgency: "emergency",
    anyOf: ["seizure"],
    reasons: [
      "Active or recurrent convulsions require urgent medical attention to prevent injury and complications.",
    ],
    nextSteps: [
      "Call your local emergency number, particularly if this is a first seizure or lasts over five minutes.",
      "Clear the area of hard, sharp, or hot objects.",
      "Do not restrain the person or place anything in their mouth.",
      "Track the duration of the seizure.",
    ],
    warningSigns: [
      "Seizure lasting longer than five minutes.",
      "Difficulty breathing after convulsions stop.",
      "Second seizure occurring shortly after the first.",
    ],
    reviewed: false,
  },

  // ── 9. Poisoning or overdose ───────────────────────────────────────
  {
    id: "poisoning-overdose",
    label: "Possible poisoning or overdose",
    urgency: "emergency",
    anyOf: ["poisoning", "overdose"],
    reasons: [
      "Ingesting toxic substances or taking excessive medication requires immediate medical evaluation.",
    ],
    nextSteps: [
      "Call your local poison control centre or emergency number immediately.",
      "Do not induce vomiting unless explicitly directed by a poison specialist.",
      "Keep packaging or bottles ready to describe the substance and quantity.",
    ],
    warningSigns: [
      "Severe drowsiness, slurred speech, or unresponsiveness.",
      "Irregular breathing or seizures.",
    ],
    reviewed: false,
  },

  // ── 10. Sudden severe headache ─────────────────────────────────────
  // Needs "worst headache", "thunderclap", or "sudden" with "severe"
  {
    id: "sudden-severe-headache",
    label: "Sudden severe headache",
    urgency: "emergency",
    anyOfAll: [
      ["worst headache"],
      ["thunderclap"],
      ["sudden", "severe headache"],
      ["sudden", "severe"],
    ],
    reasons: [
      "A headache that strikes suddenly like thunderclap or reaches peak intensity in seconds warrants immediate evaluation.",
    ],
    nextSteps: [
      "Call your local emergency number or proceed directly to an emergency department.",
      "Record the exact time the sudden severe headache began.",
      "Avoid taking pain medications before being evaluated.",
    ],
    warningSigns: [
      "Stiff neck, high fever, or confusion.",
      "Vision changes or one-sided weakness.",
    ],
    reviewed: false,
  },

  // ── 11. Vomiting or coughing blood ─────────────────────────────────
  {
    id: "vomiting-coughing-blood",
    label: "Vomiting or coughing blood",
    urgency: "emergency",
    anyOf: ["vomiting blood", "coughing blood"],
    reasons: [
      "Active bleeding in the airway or upper digestive tract is a serious medical emergency.",
    ],
    nextSteps: [
      "Call your local emergency number or proceed directly to an emergency department.",
      "Sit upright or lean forward slightly to keep the airway clear.",
      "Avoid food or drinks until evaluated by a clinician.",
    ],
    warningSigns: [
      "Coughing or vomiting substantial amounts of bright red blood or dark grounds.",
      "Dizziness, lightheadedness, or confusion.",
    ],
    reviewed: false,
  },

  // ── 12. Fever with stiff neck ──────────────────────────────────────
  {
    id: "fever-stiff-neck",
    label: "Fever with stiff neck",
    urgency: "emergency",
    allOf: ["fever", "stiff neck"],
    reasons: [
      "High temperature accompanied by inability to bend the neck forward can indicate severe infection.",
    ],
    nextSteps: [
      "Call your local emergency number or go to the nearest emergency department without delay.",
      "Avoid delaying medical assessment for fever-reducing medicine.",
    ],
    warningSigns: [
      "Extreme sensitivity to bright light (photophobia).",
      "Purple or dark red spots that do not blanch under pressure.",
      "Altered mental status or extreme lethargy.",
    ],
    reviewed: false,
  },

  // ── 13. Pregnancy emergency ────────────────────────────────────────
  {
    id: "pregnancy-emergency",
    label: "Pregnancy emergency concern",
    urgency: "emergency",
    allOf: ["pregnant"],
    anyOf: ["severe bleeding", "severe abdominal pain"],
    reasons: [
      "Heavy bleeding or intense abdominal pain during pregnancy requires urgent obstetric assessment.",
    ],
    nextSteps: [
      "Call your local emergency number or go to the nearest maternity emergency unit.",
      "Rest lying on your left side to maintain optimal blood flow.",
      "Do not take pain relief or other medicines without doctor approval.",
    ],
    warningSigns: [
      "Heavy vaginal bleeding soaking sanitary towels.",
      "Sharp, one-sided abdominal or shoulder-tip pain.",
      "Fainting or severe dizziness.",
    ],
    reviewed: false,
  },

  // ── 14. Diabetic emergency ─────────────────────────────────────────
  {
    id: "diabetic-emergency",
    label: "Diabetic emergency",
    urgency: "emergency",
    allOf: ["diabetic"],
    anyOf: ["low blood sugar", "sudden confusion"],
    reasons: [
      "Severe hypoglycemia or acute confusion in diabetes requires swift corrective action.",
    ],
    nextSteps: [
      "If the person is awake and able to swallow, give fast-acting sugar (such as fruit juice or glucose tablets).",
      "Call your local emergency number if symptoms do not improve after fifteen minutes or if consciousness declines.",
      "Do not attempt to feed an unconscious or semi-conscious individual.",
    ],
    warningSigns: [
      "Seizures, combative behaviour, or complete loss of consciousness.",
      "Inability to swallow fluids safely.",
    ],
    reviewed: false,
  },

  // ── 15. Infant fever (under 3 months) ──────────────────────────────
  {
    id: "infant-fever-under-3m",
    label: "Fever in very young infant (under 3 months)",
    urgency: "emergency",
    anyOf: ["fever"],
    ageRange: {
      minMonths: 0,
      maxMonths: 3,
      category: "infant",
      fallbackCategory: "infant",
    },
    reasons: [
      "Any fever in an infant under three months old requires urgent assessment due to high vulnerability.",
    ],
    nextSteps: [
      "Seek emergency medical evaluation or contact your local emergency service immediately.",
      "Do not give fever medication without direct advice from a doctor.",
    ],
    warningSigns: [
      "Poor feeding, weak cry, or abnormal lethargy.",
      "Unusual breathing patterns or cold hands and feet.",
    ],
    reviewed: false,
  },

  // ── 16. Bulging fontanelle ─────────────────────────────────────────
  {
    id: "bulging-fontanelle",
    label: "Bulging soft spot on infant head",
    urgency: "emergency",
    anyOf: ["bulging fontanelle"],
    ageRange: {
      minMonths: 0,
      maxMonths: 18,
      category: "infant",
      fallbackCategory: "infant",
    },
    reasons: [
      "A tense or bulging fontanelle when the baby is calm can indicate elevated intracranial pressure.",
    ],
    nextSteps: [
      "Seek immediate emergency care at the nearest hospital.",
      "Keep the infant upright and calm during transport.",
    ],
    warningSigns: [
      "Persistent vomiting, extreme irritability, or high-pitched crying.",
      "Fever or seizures.",
    ],
    reviewed: false,
  },

  // ── 17. Suicidal thoughts (Crisis rule) ─────────────────────────────
  {
    id: "suicidal-thoughts",
    label: "Crisis support – thoughts of suicide",
    urgency: "emergency",
    category: "crisis",
    anyOf: ["suicidal thoughts"],
    reasons: [
      "Experiencing thoughts of suicide is a critical crisis.",
    ],
    nextSteps: [
      "If you are in immediate danger, contact your local emergency number now.",
      "If you can, avoid being alone right now.",
      "Contact your local suicide prevention or crisis helpline.",
      "Reach out to someone you trust — a relative, friend, or healthcare worker.",
    ],
    warningSigns: [
      "Developing specific plans, researching means, or saying final goodbyes.",
      "Overwhelming feelings of hopelessness or being a burden.",
    ],
    reviewed: false,
  },

  // ── 18. Self-harm (Crisis rule) ────────────────────────────────────
  {
    id: "self-harm",
    label: "Crisis support – self-harm",
    urgency: "emergency",
    category: "crisis",
    anyOf: ["self-harm"],
    reasons: [
      "Active self-harm or strong impulses to inflict injury warrant immediate emotional and medical care.",
    ],
    nextSteps: [
      "If you are in immediate danger, contact your local emergency number now.",
      "If you can, avoid being alone right now.",
      "Connect with a local crisis helpline or text support service.",
      "If there are bleeding wounds or acute physical injuries, seek urgent medical treatment.",
      "Speak with a healthcare professional or trusted person in your life.",
    ],
    warningSigns: [
      "Escalating severity or frequency of injuries.",
      "Total withdrawal from usual support systems.",
    ],
    reviewed: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  //  URGENT (10 rules)
  // ═══════════════════════════════════════════════════════════════════

  // ── 19. Severe headache (without sudden onset / thunderclap) ────────
  {
    id: "severe-headache",
    label: "Severe headache",
    urgency: "urgent",
    anyOf: ["severe headache"],
    reasons: [
      "A severe headache warrants prompt clinical evaluation to determine the cause and provide effective relief.",
    ],
    nextSteps: [
      "Seek urgent same-day medical evaluation at an urgent care clinic or primary doctor.",
      "Rest in a quiet, darkened room.",
      "Stay hydrated and avoid strenuous activities.",
    ],
    warningSigns: [
      "Headache becoming suddenly worse or accompanied by fever and stiff neck.",
      "Visual disturbances, speech difficulties, or limb weakness.",
    ],
    reviewed: false,
  },

  // ── 20. Focal neurological deficit (non-sudden, single sign) ────────
  {
    id: "neurological-deficit",
    label: "Neurological concern",
    urgency: "urgent",
    anyOf: [
      "arm weakness",
      "leg weakness",
      "one-sided weakness",
      "weakness",
      "trouble walking",
      "vision loss",
      "numbness",
    ],
    reasons: [
      "Focal neurological symptoms such as limb weakness, walking difficulty, or vision changes warrant prompt medical evaluation.",
    ],
    nextSteps: [
      "Seek urgent same-day medical assessment with a doctor or urgent care clinic.",
      "If symptoms suddenly worsen or facial drooping or speech difficulty develops, call emergency services immediately.",
      "Rest safely to avoid falls or injury.",
    ],
    warningSigns: [
      "Sudden onset of confusion, slurred speech, or facial drooping.",
      "Rapid spread of weakness or numbness.",
    ],
    reviewed: false,
  },

  // ── 21. Fainting ───────────────────────────────────────────────────
  {
    id: "fainting",
    label: "Fainting episode",
    urgency: "urgent",
    anyOf: ["fainted"],
    reasons: [
      "Temporary loss of consciousness should be checked promptly to establish the underlying trigger.",
    ],
    nextSteps: [
      "Lie down and elevate your feet until feeling fully steady.",
      "Arrange a same-day medical evaluation with a doctor.",
      "Seek emergency care if consciousness was lost for more than one minute or occurred during exertion.",
    ],
    warningSigns: [
      "Chest discomfort or palpitations preceding the event.",
      "Fainting during exercise or while lying down.",
    ],
    reviewed: false,
  },

  // ── 22. Head injury ────────────────────────────────────────────────
  {
    id: "head-injury",
    label: "Head injury",
    urgency: "urgent",
    anyOf: ["head injury"],
    reasons: [
      "Impact to the head requires medical review to check for concussion or intracranial swelling.",
    ],
    nextSteps: [
      "Seek urgent medical assessment within a few hours of the injury.",
      "Apply a cold pack wrapped in a cloth to reduce surface swelling.",
      "Have an adult monitor alertness over the next twenty-four hours.",
    ],
    warningSigns: [
      "Repeated vomiting or worsening headache.",
      "Unequal pupil sizes or fluid leaking from the nose or ears.",
    ],
    reviewed: false,
  },

  // ── 23. Burn ───────────────────────────────────────────────────────
  {
    id: "burn",
    label: "Burn or scald",
    urgency: "urgent",
    anyOf: ["burn"],
    reasons: [
      "Burn injuries carry risks of infection, deep tissue damage, and fluid imbalance.",
    ],
    nextSteps: [
      "Cool the burn with cool running water for twenty minutes as soon as possible.",
      "Cover loosely with clear plastic wrap or a sterile non-adherent dressing.",
      "Seek medical treatment promptly for large, blistering, or chemical burns.",
    ],
    warningSigns: [
      "Burns larger than the palm of the injured person.",
      "Burns involving hands, face, joints, or genitals.",
    ],
    reviewed: false,
  },

  // ── 24. Infant fever (3–12 months) ─────────────────────────────────
  {
    id: "infant-fever-3-12m",
    label: "Fever in infant (3–12 months)",
    urgency: "urgent",
    anyOf: ["fever"],
    ageRange: { minMonths: 3, maxMonths: 12, category: "infant" },
    reasons: [
      "Infants between three and twelve months with fever require timely assessment to exclude significant infections.",
    ],
    nextSteps: [
      "Contact your paediatrician or urgent care clinic for a same-day appointment.",
      "Offer small, frequent fluids to prevent dehydration.",
      "Check temperature regularly and note any behavioural changes.",
    ],
    warningSigns: [
      "High fever that does not come down with medication.",
      "Refusal of fluids, dry mouth, or lack of wet nappies.",
    ],
    reviewed: false,
  },

  // ── 25. Infant not feeding ─────────────────────────────────────────
  {
    id: "infant-not-feeding",
    label: "Infant not feeding",
    urgency: "urgent",
    anyOf: ["not feeding"],
    ageRange: {
      minMonths: 0,
      maxMonths: 12,
      category: "infant",
      fallbackCategory: "infant",
    },
    reasons: [
      "Refusal to feed in infants can quickly lead to dehydration and low energy.",
    ],
    nextSteps: [
      "Consult your paediatric clinician or visit an urgent care centre today.",
      "Record wet nappies over a twenty-four hour period.",
    ],
    warningSigns: [
      "Significantly fewer wet nappies than usual.",
      "Sunken eyes, sunken fontanelle, or no tears when crying.",
    ],
    reviewed: false,
  },

  // ── 26. Severe abdominal pain ──────────────────────────────────────
  {
    id: "severe-abdominal-pain",
    label: "Severe abdominal pain",
    urgency: "urgent",
    anyOf: ["severe abdominal pain"],
    reasons: [
      "Intense stomach pain may stem from conditions such as appendicitis, bowel obstruction, or stones.",
    ],
    nextSteps: [
      "Visit an urgent care centre or emergency department promptly for clinical evaluation.",
      "Avoid eating solid food or drinking large quantities until assessed.",
      "Avoid applying hot water bottles directly to unexamined severe belly pain.",
    ],
    warningSigns: [
      "Pain that shifts and intensifies in the lower right abdomen.",
      "Abdomen that feels board-like, rigid, or extremely tender to touch.",
    ],
    reviewed: false,
  },

  // ── 27. Older-adult fever with severity >= 4 ───────────────────────
  {
    id: "older-adult-fever",
    label: "Fever in an older adult",
    urgency: "urgent",
    anyOf: ["fever"],
    ageRange: {
      minMonths: 780,
      category: "older-adult",
      fallbackCategory: "older-adult",
    },
    minSeverity: 4,
    reasons: [
      "Fever with moderate to high discomfort in an older adult carries greater risk of serious infection.",
    ],
    nextSteps: [
      "Schedule a same-day medical appointment with a primary care provider or urgent clinic.",
      "Maintain fluid intake to prevent dehydration.",
      "Observe for subtle shifts in thinking, awareness, or balance.",
    ],
    warningSigns: [
      "Sudden confusion, disorientation, or drowsiness.",
      "Rapid breathing or unsteady gait.",
    ],
    reviewed: false,
  },

  // ── 28. High severity catch-all ────────────────────────────────────
  {
    id: "high-severity-unmatched",
    label: "High symptom severity",
    urgency: "urgent",
    minSeverity: 5,
    reasons: [
      "Self-reported symptom severity of 5 or higher warrants professional clinical evaluation.",
    ],
    nextSteps: [
      "Seek medical advice from an urgent care centre or consult a healthcare professional today.",
      "If symptoms intensify or new red-flag symptoms arise, seek emergency care.",
    ],
    warningSigns: [
      "Rapidly escalating pain or distress.",
      "Development of breathlessness, high fever, or confusion.",
    ],
    reviewed: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  //  SEE-CLINICIAN (1 rule)
  // ═══════════════════════════════════════════════════════════════════

  // ── 29. Hives alone ────────────────────────────────────────────────
  {
    id: "hives-alone",
    label: "Hives (allergic skin reaction)",
    urgency: "see-clinician",
    anyOf: ["hives"],
    reasons: [
      "Urticaria without respiratory or facial swelling should be seen by a doctor or pharmacist for management.",
    ],
    nextSteps: [
      "Consult a healthcare professional or pharmacist regarding antihistamines.",
      "Avoid suspected food, medication, or environmental allergens.",
      "Seek urgent care if breathing changes or swelling spreads to the mouth or throat.",
    ],
    warningSigns: [
      "Any onset of tongue, throat, or facial swelling.",
      "Shortness of breath or wheezing.",
    ],
    reviewed: false,
  },
];
