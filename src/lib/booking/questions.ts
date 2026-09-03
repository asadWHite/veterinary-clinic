import type { ReasonKey, Urgency } from "@/lib/types";

/**
 * Adaptive questionnaire graph.
 *
 * Rules:
 *  - questions are language-neutral (keys + values), labels resolve in the UI
 *  - only questions whose `show` predicate passes are asked
 *  - a branch never asks questions belonging to another branch
 */
export const QUESTIONS: Record<string, import("@/lib/types").QuestionDefinition> = {
  // ---- vaccination -------------------------------------------------------
  vaccine_type: {
    key: "vaccine_type",
    type: "single",
    options: [
      { value: "complex" },
      { value: "rabies" },
      { value: "unknown" },
      { value: "other" },
    ],
  },
  vaccine_status: {
    key: "vaccine_status",
    type: "single",
    options: [
      { value: "yes" },
      { value: "no" },
      { value: "unknown" },
    ],
  },
  last_vaccine_when: {
    key: "last_vaccine_when",
    type: "single",
    show: (a) => a.vaccine_status === "yes" || a.vaccine_status === "unknown",
    options: [
      { value: "lt_6m" },
      { value: "6_12m" },
      { value: "gt_12m" },
      { value: "unknown" },
    ],
  },
  recent_illness: {
    key: "recent_illness",
    type: "single",
    options: [
      { value: "yes" },
      { value: "no" },
    ],
  },
  // ---- triage ------------------------------------------------------------
  main_concern: {
    key: "main_concern",
    type: "single",
    options: [
      { value: "not_eating" },
      { value: "vomiting" },
      { value: "diarrhea" },
      { value: "coughing" },
      { value: "breathing", urgency: "urgent" },
      { value: "pain" },
      { value: "low_energy" },
      { value: "skin" },
      { value: "behavior" },
      { value: "other" },
    ],
  },
  // ---- not eating / low energy / behaviour -------------------------------
  not_eating_duration: {
    key: "not_eating_duration",
    type: "single",
    options: [
      { value: "lt_12h" },
      { value: "12_24h", urgency: "soon" },
      { value: "24_48h", urgency: "soon" },
      { value: "gt_48h", urgency: "urgent" },
    ],
  },
  still_drinking: {
    key: "still_drinking",
    type: "single",
    options: [
      { value: "yes" },
      { value: "little", urgency: "soon" },
      { value: "no", urgency: "urgent" },
    ],
  },
  energy_level: {
    key: "energy_level",
    type: "single",
    options: [
      { value: "normal" },
      { value: "slightly_low", urgency: "soon" },
      { value: "very_low", urgency: "urgent" },
    ],
  },
  // ---- vomiting ----------------------------------------------------------
  vomiting_duration: {
    key: "vomiting_duration",
    type: "single",
    options: [
      { value: "today" },
      { value: "1_2_days", urgency: "soon" },
      { value: "gt_2_days", urgency: "urgent" },
    ],
  },
  vomiting_frequency: {
    key: "vomiting_frequency",
    type: "single",
    options: [
      { value: "once" },
      { value: "few", urgency: "soon" },
      { value: "repeated", urgency: "urgent" },
    ],
  },
  can_drink: {
    key: "can_drink",
    type: "single",
    options: [
      { value: "yes" },
      { value: "no", urgency: "urgent" },
    ],
  },
  // ---- diarrhoea ---------------------------------------------------------
  diarrhea_duration: {
    key: "diarrhea_duration",
    type: "single",
    options: [
      { value: "today" },
      { value: "1_2_days", urgency: "soon" },
      { value: "gt_2_days", urgency: "urgent" },
    ],
  },
  diarrhea_blood: {
    key: "diarrhea_blood",
    type: "single",
    options: [
      { value: "yes", urgency: "urgent" },
      { value: "no" },
    ],
  },
  // ---- coughing ----------------------------------------------------------
  cough_duration: {
    key: "cough_duration",
    type: "single",
    options: [
      { value: "today" },
      { value: "few_days", urgency: "soon" },
      { value: "weeks", urgency: "soon" },
    ],
  },
  cough_type: {
    key: "cough_type",
    type: "single",
    options: [
      { value: "dry" },
      { value: "wet" },
      { value: "honking", urgency: "soon" },
    ],
  },
  // ---- breathing ---------------------------------------------------------
  breathing_since: {
    key: "breathing_since",
    type: "single",
    options: [
      { value: "now", urgency: "urgent" },
      { value: "today", urgency: "urgent" },
      { value: "yesterday", urgency: "urgent" },
    ],
  },
  breathing_rest: {
    key: "breathing_rest",
    type: "single",
    options: [
      { value: "yes", urgency: "urgent" },
      { value: "no", urgency: "soon" },
    ],
  },
  // ---- pain --------------------------------------------------------------
  pain_where: {
    key: "pain_where",
    type: "single",
    options: [
      { value: "abdomen", urgency: "soon" },
      { value: "limb" },
      { value: "back" },
      { value: "mouth" },
      { value: "ear" },
      { value: "unknown" },
    ],
  },
  pain_severity: {
    key: "pain_severity",
    type: "single",
    options: [
      { value: "mild" },
      { value: "moderate", urgency: "soon" },
      { value: "severe", urgency: "urgent" },
    ],
  },
  // ---- injury ------------------------------------------------------------
  injury_what: { key: "injury_what", type: "text", placeholder: "notePlaceholder" },
  injury_when: {
    key: "injury_when",
    type: "single",
    options: [
      { value: "now", urgency: "urgent" },
      { value: "today", urgency: "soon" },
      { value: "yesterday" },
      { value: "earlier" },
    ],
  },
  injury_severe: {
    key: "injury_severe",
    type: "single",
    options: [
      { value: "yes", urgency: "urgent" },
      { value: "no" },
    ],
  },
  // ---- skin --------------------------------------------------------------
  skin_sign: {
    key: "skin_sign",
    type: "multi",
    options: [
      { value: "itching" },
      { value: "redness" },
      { value: "hair_loss" },
      { value: "wounds", urgency: "soon" },
      { value: "lumps", urgency: "soon" },
      { value: "parasites" },
      { value: "other" },
    ],
  },
  skin_duration: {
    key: "skin_duration",
    type: "single",
    options: [
      { value: "few_days" },
      { value: "weeks" },
      { value: "months" },
    ],
  },
  skin_itching: {
    key: "skin_itching",
    type: "single",
    options: [
      { value: "yes" },
      { value: "no" },
    ],
  },
  // ---- dental ------------------------------------------------------------
  dental_sign: {
    key: "dental_sign",
    type: "multi",
    options: [
      { value: "bad_breath" },
      { value: "tartar" },
      { value: "tooth_loss" },
      { value: "pain_eating", urgency: "soon" },
      { value: "drooling" },
      { value: "other" },
    ],
  },
  dental_duration: {
    key: "dental_duration",
    type: "single",
    options: [
      { value: "few_days" },
      { value: "weeks" },
      { value: "months" },
    ],
  },
  // ---- nutrition ---------------------------------------------------------
  nutrition_goal: {
    key: "nutrition_goal",
    type: "single",
    options: [
      { value: "weight" },
      { value: "puppy" },
      { value: "senior" },
      { value: "allergy" },
      { value: "home_food" },
    ],
  },
  nutrition_food: { key: "nutrition_food", type: "text", placeholder: "notePlaceholder" },
  // ---- surgery -----------------------------------------------------------
  surgery_type: {
    key: "surgery_type",
    type: "single",
    options: [
      { value: "sterilization" },
      { value: "dental" },
      { value: "lump" },
      { value: "orthopedic" },
      { value: "other" },
    ],
  },
  surgery_when: {
    key: "surgery_when",
    type: "single",
    options: [
      { value: "asap", urgency: "soon" },
      { value: "weeks" },
      { value: "planning" },
    ],
  },
  // ---- routine check-up --------------------------------------------------
  checkup_last: {
    key: "checkup_last",
    type: "single",
    options: [
      { value: "lt_6m" },
      { value: "6_12m" },
      { value: "gt_12m" },
      { value: "never" },
    ],
  },
  checkup_concern: {
    key: "checkup_concern",
    type: "multi",
    options: [
      { value: "weight" },
      { value: "behavior" },
      { value: "food" },
      { value: "mobility" },
      { value: "nothing" },
    ],
  },
  // ---- free text ---------------------------------------------------------
  other_text: { key: "other_text", type: "text", placeholder: "notePlaceholder" },
  extra_note: {
    key: "extra_note",
    type: "text",
    optional: true,
    placeholder: "notePlaceholder",
  },
};

const REASON_ENTRIES: Record<ReasonKey, string[]> = {
  checkup: ["checkup_last", "checkup_concern", "extra_note"],
  vaccination: ["vaccine_type", "vaccine_status", "last_vaccine_when", "recent_illness", "extra_note"],
  something_wrong: ["main_concern"],
  injury: ["injury_what", "injury_when", "injury_severe", "extra_note"],
  skin: ["skin_sign", "skin_duration", "skin_itching", "extra_note"],
  dental: ["dental_sign", "dental_duration", "extra_note"],
  nutrition: ["nutrition_goal", "nutrition_food", "extra_note"],
  surgery: ["surgery_type", "surgery_when", "extra_note"],
  other: ["other_text"],
};

const CONCERN_ENTRIES: Record<string, string[]> = {
  not_eating: ["not_eating_duration", "still_drinking", "energy_level", "extra_note"],
  vomiting: ["vomiting_duration", "vomiting_frequency", "can_drink", "extra_note"],
  diarrhea: ["diarrhea_duration", "diarrhea_blood", "energy_level", "extra_note"],
  coughing: ["cough_duration", "cough_type", "energy_level", "extra_note"],
  breathing: ["breathing_since", "breathing_rest", "extra_note"],
  pain: ["pain_where", "pain_severity", "extra_note"],
  low_energy: ["not_eating_duration", "still_drinking", "extra_note"],
  skin: ["skin_sign", "skin_duration", "skin_itching", "extra_note"],
  behavior: ["not_eating_duration", "energy_level", "extra_note"],
  other: ["other_text"],
};

/** Full ordered sequence for a reason + current answers (branch aware). */
export function questionSequence(reason: ReasonKey, answers: Record<string, string>): string[] {
  const keys = [...(REASON_ENTRIES[reason] ?? [])];
  if (reason === "something_wrong") {
    const concern = answers.main_concern;
    if (concern && CONCERN_ENTRIES[concern]) {
      keys.push(...CONCERN_ENTRIES[concern]);
    } else {
      keys.push("other_text");
    }
  }
  const result: string[] = [];
  for (const key of keys) {
    const question = QUESTIONS[key];
    if (!question) continue;
    if (question.show && !question.show(answers)) continue;
    result.push(key);
  }
  return result;
}

/** First unanswered question, or null when the branch is complete. */
export function nextQuestionKey(
  reason: ReasonKey,
  answers: Record<string, string>,
): string | null {
  const sequence = questionSequence(reason, answers);
  for (const key of sequence) {
    const value = answers[key];
    if (value === undefined || value === "") return key;
  }
  return null;
}

/**
 * Drop answers that no longer belong to the active branch.
 * Unrelated booking state (pet, doctor, date, client) is never touched.
 */
export function pruneAnswers(
  reason: ReasonKey,
  answers: Record<string, string>,
): Record<string, string> {
  const sequence = new Set(questionSequence(reason, answers));
  const pruned: Record<string, string> = {};
  for (const [key, value] of Object.entries(answers)) {
    if (sequence.has(key) && value !== "") pruned[key] = value;
  }
  return pruned;
}

/** Highest urgency signalled by the given answers. */
export function computeUrgency(
  reason: ReasonKey,
  answers: Record<string, string>,
  lifeStage?: string,
): Urgency {
  let urgency: Urgency = "routine";
  const bump = (level: Urgency) => {
    if (level === "urgent") urgency = "urgent";
    else if (level === "soon" && urgency === "routine") urgency = "soon";
  };
  for (const key of Object.keys(answers)) {
    const question = QUESTIONS[key];
    if (!question?.options) continue;
    const values = answers[key].split(",").filter(Boolean);
    for (const value of values) {
      const option = question.options.find((option) => option.value === value);
      if (option?.urgency) bump(option.urgency);
    }
  }
  if (reason === "injury" && answers.injury_when === "now") bump("urgent");
  if (lifeStage === "baby" && reason === "something_wrong" && urgency === "routine") bump("soon");
  if (reason === "something_wrong" && answers.main_concern === "breathing") bump("urgent");
  return urgency;
}
