"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import { formatDateLong, minutesToTime } from "@/lib/format";
import { nextQuestionKey } from "@/lib/booking/questions";
import type { BookingState } from "@/lib/types";
import {
  SPECIES_IMAGES,
  STEP_LABEL_KEYS,
  BOOKING_STEPS,
  STORAGE_KEY,
  createInitialBookingState,
  loadDraft,
  saveDraft,
  type BookingDoctor,
  type BookingService,
  type BookingStep,
  type PetOption,
} from "@/features/booking/state";
import {
  AgeSelector,
  AnimalSelector,
  PetSelector,
  ReasonSelector,
  type StepApi,
} from "@/features/booking/steps/OpeningSteps";
import { Questionnaire } from "@/features/booking/steps/Questionnaire";
import { DoctorSelector, Recommendation } from "@/features/booking/steps/ChoiceSteps";
import { DateTimeStep } from "@/features/booking/steps/ScheduleStep";
import { ClientStep, Confirmation, SummaryStep } from "@/features/booking/steps/ClosingSteps";

export type BookingFlowProps = {
  services: BookingService[];
  doctors: BookingDoctor[];
  pets: PetOption[];
  isAuthenticated: boolean;
  userId: number | null;
  timezone: string;
  preselectedServiceSlug: string | null;
  preselectedDoctorId: number | null;
  clientDefaults: { name: string; phone: string; email: string };
};

export function BookingFlow(props: BookingFlowProps) {
  const { t, locale } = useI18n();
  const [state, setState] = useState<BookingState>(() =>
    createInitialBookingState({
      preselectedServiceSlug: props.preselectedServiceSlug,
      preselectedDoctorId: props.preselectedDoctorId,
      clientName: props.clientDefaults.name,
      clientPhone: props.clientDefaults.phone,
      clientEmail: props.clientDefaults.email,
    }),
  );

  // Draft lives in sessionStorage → switching language keeps every answer,
  // and a reload can be resumed explicitly (hydration-safe read).
  const draftSignature = useSyncExternalStore(
    () => () => {},
    () => (typeof window === "undefined" ? null : window.sessionStorage.getItem(STORAGE_KEY)),
    () => null,
  );
  const [restoredSignature, setRestoredSignature] = useState<string | null>(null);
  const draft = useMemo(() => {
    if (!draftSignature || draftSignature === restoredSignature) return null;
    return loadDraft();
  }, [draftSignature, restoredSignature]);

  function resumeDraft() {
    if (!draft) return;
    setRestoredSignature(draftSignature);
    setState({
      ...draft,
      selectedServiceSlug: draft.selectedServiceSlug ?? props.preselectedServiceSlug ?? null,
      doctorId:
        props.preselectedDoctorId && draft.doctorId === "any"
          ? props.preselectedDoctorId
          : draft.doctorId,
      client: {
        ...draft.client,
        name: draft.client.name || props.clientDefaults.name,
        phone: draft.client.phone || props.clientDefaults.phone,
        email: draft.client.email || props.clientDefaults.email,
      },
    });
  }

  useEffect(() => {
    saveDraft(state);
  }, [state]);

  const set = (patch: Partial<BookingState>) => setState((current) => ({ ...current, ...patch }));
  const go = (step: BookingState["step"]) => setState((current) => ({ ...current, step }));

  const stepApi: StepApi = { state, set, go };

  // A branch with no open questions renders the recommendation directly —
  // derived during render instead of navigating inside an effect.
  const effectiveStep: BookingStep =
    state.step === "questions" &&
    state.reason &&
    nextQuestionKey(state.reason, state.answers) === null
      ? "recommendation"
      : (state.step as BookingStep);

  const activeService = useMemo(
    () => props.services.find((service) => service.slug === state.selectedServiceSlug) ?? null,
    [props.services, state.selectedServiceSlug],
  );

  const currentIndex = BOOKING_STEPS.indexOf(effectiveStep);
  const progress = Math.round(((currentIndex + 1) / BOOKING_STEPS.length) * 100);

  const header: Record<string, { title: string; lead: string }> = {
    animal: { title: t("booking.animal.question"), lead: t("booking.animal.lead") },
    pet: { title: t("booking.pet.question"), lead: t("booking.pet.lead") },
    age: { title: t("booking.age.question"), lead: t("booking.age.lead") },
    reason: { title: t("booking.reason.question"), lead: t("booking.reason.lead") },
    questions: { title: "", lead: t("booking.questions.lead") },
    recommendation: { title: t("booking.recommendation.label"), lead: "" },
    doctor: { title: t("booking.doctor.question"), lead: t("booking.doctor.lead") },
    datetime: { title: t("booking.datetime.question"), lead: t("booking.datetime.lead") },
    client: { title: t("booking.client.question"), lead: t("booking.client.lead") },
    summary: { title: t("booking.summary.question"), lead: t("booking.summary.lead") },
    confirmation: { title: t("booking.confirmation.title"), lead: t("booking.confirmation.lead") },
  };

  const current = header[effectiveStep] ?? header.animal;
  const showHeaderTitle = effectiveStep !== "questions" && effectiveStep !== "confirmation";

  return (
    <div className="mx-auto grid w-full max-w-[100rem] grid-cols-1 gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[19rem_1fr] lg:gap-16 lg:px-12 lg:py-20">
      <aside className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <span className="label-eyebrow">{t("booking.title")}</span>
          <div className="h-px w-full bg-line">
            <div
              className="h-px bg-forest transition-all duration-700"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <ol className="hidden flex-col lg:flex">
          {BOOKING_STEPS.map((step, index) => {
            const isActive = effectiveStep === step;
            const isDone = index < currentIndex;
            return (
              <li
                key={step}
                className={cn(
                  "flex items-baseline gap-3 border-b border-line py-2.5 text-sm",
                  isActive ? "text-forest" : isDone ? "text-ink" : "text-sage",
                )}
              >
                <span className="font-serif text-xs">{String(index + 1).padStart(2, "0")}</span>
                <span>{t(STEP_LABEL_KEYS[step])}</span>
              </li>
            );
          })}
        </ol>

        <div className="hidden flex-col gap-4 border border-line bg-canvas-2/50 p-5 lg:flex">
          <span className="label-eyebrow">{t("booking.summary.pet")}</span>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas">
            <Image
              src={SPECIES_IMAGES[state.species]}
              alt={t(`species.${state.species}`)}
              fill
              sizes="20rem"
              className="object-cover"
            />
          </div>
          <dl className="flex flex-col gap-2 text-xs">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="label-eyebrow">{t("booking.summary.service")}</dt>
              <dd className="text-right text-ink">{activeService?.title ?? "—"}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="label-eyebrow">{t("booking.summary.date")}</dt>
              <dd className="text-right text-ink">
                {state.day ? formatDateLong(state.day, locale) : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="label-eyebrow">{t("booking.summary.time")}</dt>
              <dd className="text-right text-ink">
                {state.startMinute !== null ? minutesToTime(state.startMinute) : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </aside>

      <section className="flex min-w-0 flex-col gap-10">
        <div className="flex flex-col gap-8">
          {showHeaderTitle && (
            <div className="flex flex-col gap-4">
              <span className="label-eyebrow">
                {String(currentIndex + 1).padStart(2, "0")} / {t(STEP_LABEL_KEYS[effectiveStep])}
              </span>
              <h1 className="text-h1 font-normal tracking-tight text-ink">{current.title}</h1>
              {current.lead && (
                <p className="max-w-2xl text-[0.98rem] leading-relaxed text-ink-2">{current.lead}</p>
              )}
            </div>
          )}

          {draft && draft.confirmation === null && state.step === "animal" && (
            <div className="flex flex-col gap-3 border-l-2 border-forest bg-canvas-2/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm leading-relaxed text-ink-2">{t("booking.resumeDraft")}</span>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={resumeDraft} className="btn btn-primary !py-2.5">
                  {t("booking.resumeDraftAction")}
                </button>
                <button
                  type="button"
                  onClick={() => setRestoredSignature(draftSignature)}
                  className="btn btn-quiet !py-2.5"
                >
                  {t("booking.resumeDraftDismiss")}
                </button>
              </div>
            </div>
          )}

          {state.step === "confirmation" && <Confirmation state={state} go={go} isAuthenticated={props.isAuthenticated} />}
          {state.step !== "confirmation" && (
            <div className="flex flex-col gap-8">
              {effectiveStep === "animal" && <AnimalSelector {...stepApi} />}
              {effectiveStep === "pet" && (
                <PetSelector
                  {...stepApi}
                  pets={props.pets}
                  isAuthenticated={props.isAuthenticated}
                />
              )}
              {effectiveStep === "age" && <AgeSelector {...stepApi} />}
              {effectiveStep === "reason" && (
                <ReasonSelector
                  {...stepApi}
                  set={(patch) =>
                    set(
                      patch.reason && patch.reason !== state.reason
                        ? { ...patch, answers: {}, questionPath: [], recommendedServiceSlug: null }
                        : patch,
                    )
                  }
                />
              )}
              {effectiveStep === "questions" && <Questionnaire {...stepApi} />}
              {effectiveStep === "recommendation" && (
                <Recommendation
                  {...stepApi}
                  services={props.services}
                  onAccepted={(slug) => set({ recommendedServiceSlug: slug })}
                />
              )}
              {effectiveStep === "doctor" && <DoctorSelector {...stepApi} doctors={props.doctors} />}
              {effectiveStep === "datetime" && (
                <DateTimeStep {...stepApi} doctors={props.doctors} timezone={props.timezone} />
              )}
              {effectiveStep === "client" && <ClientStep {...stepApi} />}
              {effectiveStep === "summary" && (
                <SummaryStep
                  {...stepApi}
                  services={props.services}
                  doctors={props.doctors}
                  isAuthenticated={props.isAuthenticated}
                  userId={props.userId}
                />
              )}
            </div>
          )}
        </div>

        {state.step !== "confirmation" && state.step !== "questions" && (
          <div className="flex items-center justify-between border-t border-line pt-6">
            <button
              type="button"
              onClick={() => {
                const order = BOOKING_STEPS;
                const index = order.indexOf(effectiveStep as (typeof order)[number]);
                const previous = order[Math.max(0, index - 1)];
                go(previous);
              }}
              className="link-underline text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase"
            >
              ← {t("booking.questions.back")}
            </button>
            <span className="text-xs text-ink-2">{t("booking.lead")}</span>
          </div>
        )}
      </section>
    </div>
  );
}
