import type { Locale } from "@/lib/i18n/config";

export type Species = "dog" | "cat" | "other";
export type LifeStage = "baby" | "young" | "adult" | "senior";
export type ReasonKey =
  | "checkup"
  | "vaccination"
  | "something_wrong"
  | "injury"
  | "skin"
  | "dental"
  | "nutrition"
  | "surgery"
  | "other";
export type Urgency = "routine" | "soon" | "urgent";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";
export type SlotState = "available" | "selected" | "booked" | "blocked" | "past" | "unavailable";

export type QuestionType = "single" | "multi" | "text";

export type QuestionOption = {
  value: string;
  /** Marks answers that should raise an urgency flag. */
  urgency?: Urgency;
};

export type QuestionDefinition = {
  key: string;
  type: QuestionType;
  /** Optional follow-up gate: question is only asked when this returns true. */
  show?: (answers: Record<string, string>) => boolean;
  options?: QuestionOption[];
  placeholder?: string;
  optional?: boolean;
};

export type BookingClientInfo = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export type BookingPetDraft = {
  id: number | null;
  name: string;
  species: Species;
  breed: string;
  birthDate: string;
  weight: string;
  sex: string;
  notes: string;
};

export type BookingState = {
  step: string;
  species: Species;
  lifeStage: LifeStage;
  reason: ReasonKey | null;
  answers: Record<string, string>;
  /** Question keys visited in order — used to invalidate only the active branch. */
  questionPath: string[];
  recommendedServiceSlug: string | null;
  selectedServiceSlug: string | null;
  doctorId: number | "any";
  day: string | null;
  startMinute: number | null;
  assignedDoctorId: number | null;
  pet: BookingPetDraft | null;
  client: BookingClientInfo;
  confirmation: {
    publicId: string;
    day: string;
    startMinute: number;
    durationMinutes: number;
    doctorName: string;
    serviceName: string;
    petName: string;
    status: AppointmentStatus;
  } | null;
};

export type AvailabilitySlot = {
  minute: number;
  label: string;
  state: SlotState;
  doctorIds: number[];
};

export type AvailabilityDay = {
  day: string;
  slots: AvailabilitySlot[];
  doctorIds: number[];
};

export type DoctorCard = {
  id: number;
  slug: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string | null;
  experienceYears: number | null;
  languages: string[];
  isPlaceholder: boolean;
  serviceSlugs: string[];
  reviewCount: number;
  averageRating: number | null;
  weekdayBits: number;
};

export type ServiceCard = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  durationMinutes: number;
  sortOrder: number;
};

export type SessionUser = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: "user" | "doctor" | "admin";
  locale: Locale;
  doctorId: number | null;
};
