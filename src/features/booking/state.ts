import type {
  BookingClientInfo,
  BookingState,
  LifeStage,
  ReasonKey,
  Species,
} from "@/lib/types";

export const BOOKING_STEPS = [
  "animal",
  "pet",
  "age",
  "reason",
  "questions",
  "recommendation",
  "doctor",
  "datetime",
  "client",
  "summary",
  "confirmation",
] as const;

export type BookingStep = (typeof BOOKING_STEPS)[number];

export const STEP_LABEL_KEYS: Record<BookingStep, string> = {
  animal: "booking.steps.animal",
  pet: "booking.steps.pet",
  age: "booking.steps.age",
  reason: "booking.steps.reason",
  questions: "booking.steps.questions",
  recommendation: "booking.steps.recommendation",
  doctor: "booking.steps.doctor",
  datetime: "booking.steps.datetime",
  client: "booking.steps.client",
  summary: "booking.steps.summary",
  confirmation: "booking.steps.confirmation",
};

export function emptyClientInfo(name = "", phone = "", email = ""): BookingClientInfo {
  return { name, phone, email, notes: "" };
}

export function createInitialBookingState(input: {
  preselectedServiceSlug?: string | null;
  preselectedDoctorId?: number | null;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
}): BookingState {
  return {
    step: "animal",
    species: "dog",
    lifeStage: "adult",
    reason: null,
    answers: {},
    questionPath: [],
    recommendedServiceSlug: null,
    selectedServiceSlug: input.preselectedServiceSlug ?? null,
    doctorId: input.preselectedDoctorId ?? "any",
    day: null,
    startMinute: null,
    assignedDoctorId: null,
    pet: null,
    client: emptyClientInfo(input.clientName, input.clientPhone, input.clientEmail),
    confirmation: null,
  };
}

export const STORAGE_KEY = "vc_booking_draft_v1";

/** Draft lives in sessionStorage so switching language never loses progress. */
export function loadDraft(): BookingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookingState;
    if (!parsed || typeof parsed !== "object" || !parsed.step) return null;
    return {
      ...createInitialBookingState({}),
      ...parsed,
      answers: parsed.answers ?? {},
      client: parsed.client ?? emptyClientInfo(),
    };
  } catch {
    return null;
  }
}

export function saveDraft(state: BookingState): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — booking still works, just without a draft */
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function stepIndex(step: BookingStep): number {
  return BOOKING_STEPS.indexOf(step);
}

export function previousStep(step: BookingStep): BookingStep {
  const index = stepIndex(step);
  return BOOKING_STEPS[Math.max(0, index - 1)];
}

export type PetOption = {
  id: number;
  name: string;
  species: Species;
  breed: string | null;
  birthDate: string | null;
  weightGrams: number | null;
  photoUrl: string | null;
};

export type BookingDoctor = {
  id: number;
  slug: string;
  name: string;
  title: string;
  bio: string;
  languages: string[];
  experienceYears: number | null;
  serviceSlugs: string[];
  weekdayBits: number;
  reviewCount: number;
  averageRating: number | null;
};

export type BookingService = {
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number;
};

export const SPECIES_IMAGES: Record<Species, string> = {
  dog: "/images/dog-adult.jpg",
  cat: "/images/cat-kitten.jpg",
  other: "/images/animal-other.jpg",
};

export function speciesLabelKey(species: Species): string {
  return `booking.animal.${species}`;
}

export function lifeStageValue(stage: LifeStage): string {
  return stage;
}

export function reasonValue(reason: ReasonKey): string {
  return reason;
}
