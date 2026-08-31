"use client";

import { STAGE_ORDER, useBooking, type Stage } from "@/components/booking/BookingContext";

const STEP_KEYS: Record<Stage, string> = {
  companion: "booking.steps.companion",
  age: "booking.steps.age",
  concern: "booking.steps.concern",
  context: "booking.steps.context",
  care: "booking.steps.care",
  doctor: "booking.steps.doctor",
  time: "booking.steps.time",
  details: "booking.steps.confirm",
  done: "booking.confirmation.confirmed",
};



export function BookingProgress() {
  const { state, stageIndex, go , t, locale } = useBooking();
  if (state.stage === "done") return null;

  const reachable = Math.max(
    ...STAGE_ORDER.map((s, i) => (isComplete(state, s) ? i : -1)),
    stageIndex,
  );

  return (
    <nav aria-label={t("booking.progressLabel")} className="w-full">
      <ol className="hide-scroll flex items-stretch gap-0 overflow-x-auto border-b border-[var(--line)]">
        {STAGE_ORDER.filter((s) => s !== "done").map((stage, i) => {
          const done = i < stageIndex;
          const active = i === stageIndex;
          const available = i <= reachable || done;
          return (
            <li key={stage} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={!available}
                onClick={() => available && go(stage)}
                aria-current={active ? "step" : undefined}
                className={`group flex w-full flex-col gap-2 border-r border-[var(--line)] px-3 py-4 text-left transition-colors last:border-r-0 sm:px-4 ${
                  active ? "bg-ink text-white" : done ? "text-ink" : "text-ink/35"
                } ${available ? "hover:bg-paper" : "cursor-not-allowed"}`}
              >
                <span className="label mono-num flex items-center gap-2">
                  <span
                    className={`block h-[6px] w-[6px] ${
                      done ? "bg-forest" : active ? "bg-white" : "bg-ink/20"
                    }`}
                  />
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="label truncate">{t(STEP_KEYS[stage])}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function isComplete(state: { answers: Record<string, string | string[]>; serviceSlug: string | null; doctorId: string | null; date: string | null; time: string | null }, stage: Stage) {
  switch (stage) {
    case "companion":
      return Boolean(state.answers.species);
    case "age":
      return Boolean(state.answers.age);
    case "concern":
      return Boolean(state.answers.concern);
    case "context":
      return Boolean(state.answers.urgency);
    case "care":
      return Boolean(state.serviceSlug);
    case "doctor":
      return Boolean(state.doctorId);
    case "time":
      return Boolean(state.date && state.time);
    case "details":
      return false;
    default:
      return false;
  }
}

export const stepKeys = STEP_KEYS;
