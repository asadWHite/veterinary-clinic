import { computeUrgency } from "@/lib/booking/questions";
import type { ReasonKey, Urgency } from "@/lib/types";

export type Recommendation = {
  serviceSlug: string;
  urgency: Urgency;
  reasonKey: ReasonKey;
};

const URGENCY_SERVICE: Record<Urgency, string> = {
  routine: "general-check-up",
  soon: "general-check-up",
  urgent: "urgent-care",
};

/**
 * Maps the questionnaire outcome to a visit type. This is explicitly NOT a
 * diagnosis — the wording shown to the client always says "may be appropriate".
 */
export function recommendService(
  reason: ReasonKey,
  answers: Record<string, string>,
  lifeStage: string,
): Recommendation {
  const urgency = computeUrgency(reason, answers, lifeStage);
  const concern = answers.main_concern ?? "";
  let serviceSlug = URGENCY_SERVICE[urgency];

  switch (reason) {
    case "checkup":
      serviceSlug = "general-check-up";
      break;
    case "vaccination":
      serviceSlug = "vaccination";
      break;
    case "skin":
      serviceSlug = "dermatology";
      break;
    case "dental":
      serviceSlug = "dental-care";
      break;
    case "nutrition":
      serviceSlug = "nutrition-consultation";
      break;
    case "surgery":
      serviceSlug = "surgery";
      break;
    case "injury":
      serviceSlug = urgency === "urgent" ? "urgent-care" : "diagnostics";
      break;
    case "something_wrong":
      if (concern === "skin") serviceSlug = "dermatology";
      else if (concern === "coughing") serviceSlug = urgency === "routine" ? "diagnostics" : "urgent-care";
      else if (concern === "not_eating" || concern === "vomiting" || concern === "diarrhea") {
        serviceSlug = urgency === "urgent" ? "urgent-care" : "general-check-up";
      } else if (concern === "pain") {
        serviceSlug = urgency === "urgent" ? "urgent-care" : "general-check-up";
      } else if (concern === "low_energy" || concern === "behavior") {
        serviceSlug = urgency === "urgent" ? "urgent-care" : "general-check-up";
      } else if (concern === "breathing") {
        serviceSlug = "urgent-care";
      } else if (concern === "other") {
        serviceSlug = "general-check-up";
      }
      break;
    case "other":
      serviceSlug = "general-check-up";
      break;
  }

  return { serviceSlug, urgency, reasonKey: reason };
}

/** Human-readable "why" key used by the recommendation screen. */
export function recommendationWhyKey(reason: ReasonKey, answers: Record<string, string>): string {
  if (reason === "something_wrong" && answers.main_concern) {
    return `booking.recommendation.reasons.${reason}.${answers.main_concern}`;
  }
  return `booking.recommendation.reasons.${reason}`;
}
