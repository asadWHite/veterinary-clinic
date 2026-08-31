"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { Answers } from "@/data/questions";
import { visibleQuestions } from "@/data/questions";
import { recommend, type Recommendation } from "@/data/recommendations";
import type { DoctorWithNext } from "@/lib/clinic";
import { useI18n } from "@/i18n/I18nProvider";
import type { Translator } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export type Stage = "companion" | "age" | "concern" | "context" | "care" | "doctor" | "time" | "details" | "done";

export const STAGE_ORDER: Stage[] = [
  "companion",
  "age",
  "concern",
  "context",
  "care",
  "doctor",
  "time",
  "details",
  "done",
];

export type BookingResult = {
  publicId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  serviceName: string;
  doctorName: string;
  petName: string;
};

export type BookingState = {
  stage: Stage;
  answers: Answers;
  petId: string | null;
  petName: string;
  petBreed: string;
  /** Owner may override the recommended care. */
  serviceSlug: string | null;
  doctorId: string | null;
  date: string | null;
  time: string | null;
  owner: { name: string; phone: string; email: string; notes: string };
  result: BookingResult | null;
  error: string | null;
  submitting: boolean;
};

type Action =
  | { type: "stage"; stage: Stage }
  | { type: "answer"; id: string; value: string | string[] }
  | { type: "answers"; patch: Answers }
  | { type: "pet"; petId: string | null; petName: string; petBreed?: string }
  | { type: "field"; key: "serviceSlug" | "doctorId" | "date" | "time"; value: string | null }
  | { type: "owner"; key: keyof BookingState["owner"]; value: string }
  | { type: "submitting"; value: boolean }
  | { type: "result"; result: BookingResult }
  | { type: "error"; error: string | null }
  | { type: "reset" };

const initialState: BookingState = {
  stage: "companion",
  answers: {},
  petId: null,
  petName: "",
  petBreed: "",
  serviceSlug: null,
  doctorId: null,
  date: null,
  time: null,
  owner: { name: "", phone: "", email: "", notes: "" },
  result: null,
  error: null,
  submitting: false,
};

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case "stage":
      return { ...state, stage: action.stage, error: null };
    case "answer":
      return {
        ...state,
        answers: { ...state.answers, [action.id]: action.value },
        serviceSlug: null,
      };
    case "answers":
      return { ...state, answers: { ...state.answers, ...action.patch }, serviceSlug: null };
    case "pet":
      return {
        ...state,
        petId: action.petId,
        petName: action.petName,
        petBreed: action.petBreed ?? "",
        answers:
          action.petId && state.answers.species
            ? state.answers
            : state.answers,
      };
    case "field": {
      const next = { ...state, [action.key]: action.value } as BookingState;
      if (action.key === "doctorId" || action.key === "serviceSlug") next.time = null;
      return next;
    }
    case "owner":
      return { ...state, owner: { ...state.owner, [action.key]: action.value } };
    case "submitting":
      return { ...state, submitting: action.value };
    case "result":
      return { ...state, result: action.result, stage: "done", submitting: false };
    case "error":
      return { ...state, error: action.error, submitting: false };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

export type BookingContextValue = {
  state: BookingState;
  stageIndex: number;
  questions: ReturnType<typeof visibleQuestions>;
  recommendation: Recommendation;
  doctors: DoctorWithNext[];
  isGuest: boolean;
  t: Translator;
  locale: Locale;
  go: (stage: Stage) => void;
  next: () => void;
  back: () => void;
  setAnswer: (id: string, value: string | string[]) => void;
  setPet: (petId: string | null, petName: string, petBreed?: string) => void;
  setField: (key: "serviceSlug" | "doctorId" | "date" | "time", value: string | null) => void;
  setOwner: (key: keyof BookingState["owner"], value: string) => void;
  setError: (error: string | null) => void;
  submit: () => Promise<void>;
  reset: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({
  children,
  doctors,
  user,
  pets,
  initialDoctorId = null,
}: {
  children: ReactNode;
  doctors: DoctorWithNext[];
  user: { id: string; name: string; email: string; phone: string | null } | null;
  pets: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    ageStage: string | null;
    photoAssetId: string | null;
  }[];
  initialDoctorId?: string | null;
}) {
  const { locale, t } = useI18n();
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    doctorId: initialDoctorId,
    owner: {
      ...initialState.owner,
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  const questions = useMemo(() => visibleQuestions(state.answers), [state.answers]);
  const recommendation = useMemo(
    () => recommend(state.answers, locale),
    [state.answers, locale],
  );
  const stageIndex = STAGE_ORDER.indexOf(state.stage);

  const go = (stage: Stage) => {
    dispatch({ type: "stage", stage });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const next = () => {
    const i = STAGE_ORDER.indexOf(state.stage);
    const target = STAGE_ORDER[Math.min(i + 1, STAGE_ORDER.length - 1)];
    go(target);
  };

  const back = () => {
    const i = STAGE_ORDER.indexOf(state.stage);
    const target = STAGE_ORDER[Math.max(i - 1, 0)];
    go(target);
  };

  const setAnswer = (id: string, value: string | string[]) =>
    dispatch({ type: "answer", id, value });
  const setPet = (petId: string | null, petName: string, petBreed?: string) =>
    dispatch({ type: "pet", petId, petName, petBreed });
  const setField = (
    key: "serviceSlug" | "doctorId" | "date" | "time",
    value: string | null,
  ) => dispatch({ type: "field", key, value });
  const setOwner = (key: keyof BookingState["owner"], value: string) =>
    dispatch({ type: "owner", key, value });
  const setError = (error: string | null) => dispatch({ type: "error", error });
  const reset = () => dispatch({ type: "reset" });

  const submit = async () => {
    dispatch({ type: "submitting", value: true });
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          doctorId: state.doctorId,
          serviceSlug: state.serviceSlug ?? recommendation.serviceSlug,
          date: state.date,
          startTime: state.time,
          petId: state.petId,
          petName: state.petName,
          species: typeof state.answers.species === "string" ? state.answers.species : "dog",
          ownerName: state.owner.name,
          ownerEmail: state.owner.email,
          ownerPhone: state.owner.phone,
          notes: state.owner.notes,
          urgency: recommendation.urgency,
          answers: state.answers,
        }),
      });
      const data = (await response.json()) as {
        appointment?: BookingResult;
        error?: string;
        code?: string;
      };
      if (!response.ok || !data.appointment) {
        dispatch({ type: "error", error: localizeApiError(data.error, data.code, t) });
        if (data.error?.includes("booked") || data.error?.includes("passed")) {
          go("time");
        }
        return;
      }
      dispatch({ type: "result", result: data.appointment });
    } catch {
      dispatch({ type: "error", error: t("booking.errors.network") });
    }
  };

  const value: BookingContextValue = {
    state,
    stageIndex,
    questions,
    recommendation,
    doctors,
    isGuest: !user,
    t,
    locale,
    go,
    next,
    back,
    setAnswer,
    setPet,
    setField,
    setOwner,
    setError,
    submit,
    reset,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
      <span className="hidden">{pets.length}</span>
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}

/** Maps server error codes/messages onto the active language. */
export function localizeApiError(
  message: string | undefined,
  code: string | undefined,
  t: Translator,
): string {
  if (code === "slot-taken") return t("booking.errors.slotTaken");
  const value = message ?? "";
  if (/just booked/i.test(value)) return t("booking.errors.slotTaken");
  if (/has already passed/i.test(value)) return t("booking.errors.past");
  if (/phone number/i.test(value)) return t("booking.errors.addPhone");
  if (/add your name|add a name/i.test(value)) return t("booking.errors.addYourName");
  if (/choose a date/i.test(value)) return t("booking.errors.chooseDate");
  if (/choose a clinician/i.test(value)) return t("booking.errors.chooseClinician");
  if (/unknown service/i.test(value)) return t("booking.errors.unknownService");
  return t("booking.errors.generic");
}
