"use client";

import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import { recommendService, recommendationWhyKey } from "@/lib/booking/recommendation";
import { StatusPill } from "@/components/ui/Bits";
import type { StepApi } from "@/features/booking/steps/OpeningSteps";
import type { BookingDoctor, BookingService } from "@/features/booking/state";
import { useBookingLabels } from "@/features/booking/labels";

export function Recommendation({
  state,
  set,
  go,
  services,
  onAccepted,
}: StepApi & { services: BookingService[]; onAccepted?: (slug: string) => void }) {
  const { t } = useI18n();
  const { questionValue, questionLabel } = useBookingLabels();
  const reason = state.reason ?? "other";
  const recommendation = recommendService(reason, state.answers, state.lifeStage);
  const recommended = services.find((service) => service.slug === recommendation.serviceSlug) ?? null;
  const chosen = state.selectedServiceSlug
    ? services.find((service) => service.slug === state.selectedServiceSlug) ?? null
    : null;
  const effective = chosen ?? recommended;

  const differs = Boolean(chosen && recommended && chosen.slug !== recommended.slug);

  const urgencyLabel =
    recommendation.urgency === "urgent"
      ? t("booking.recommendation.urgencyUrgent")
      : recommendation.urgency === "soon"
        ? t("booking.recommendation.urgencySoon")
        : t("booking.recommendation.urgencyRoutine");

  const answerEntries = Object.entries(state.answers).filter(([, value]) => value.trim() !== "");

  return (
    <div className="step-enter flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <span className="label-eyebrow">{t("booking.recommendation.label")}</span>
        <h3 className="max-w-3xl text-h2 font-normal leading-tight tracking-tight text-ink">
          {t("booking.recommendation.title")}
        </h3>
      </div>

      {effective && (
        <div className="grid grid-cols-1 gap-8 border border-line bg-canvas-2/50 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-5">
            <span className="label-eyebrow">{t("booking.recommendation.service")}</span>
            <p className="text-3xl tracking-tight text-ink">{effective.title}</p>
            <p className="max-w-lg text-[0.95rem] leading-relaxed text-ink-2">{effective.summary}</p>
            <div className="flex flex-wrap items-center gap-6 border-t border-line pt-5 text-sm">
              <span className="flex flex-col gap-1">
                <span className="label-eyebrow">{t("booking.recommendation.duration")}</span>
                <span className="text-ink">
                  {effective.durationMinutes} {t("common.minutesFull")}
                </span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="label-eyebrow">{t("booking.recommendation.urgency")}</span>
                <StatusPill status={recommendation.urgency} label={urgencyLabel} />
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-line pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <span className="label-eyebrow">{t("booking.recommendation.why")}</span>
            <p className="text-[0.95rem] leading-relaxed text-ink-2">
              {t(recommendationWhyKey(reason, state.answers))}
            </p>
            <p className="mt-auto text-xs leading-relaxed text-ink-2">
              {t("booking.recommendation.disclaimer")}
            </p>
          </div>
        </div>
      )}

      {differs && recommended && chosen && (
        <div className="flex flex-col gap-4">
          <span className="label-eyebrow">{t("booking.recommendation.changeService")}</span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[recommended, chosen].map((service) => (
              <button
                key={service.slug}
                type="button"
                onClick={() => set({ selectedServiceSlug: service.slug, day: null, startMinute: null })}
                className={cn(
                  "flex flex-col gap-2 border p-5 text-left transition-colors",
                  state.selectedServiceSlug === service.slug
                    ? "border-forest bg-canvas-2/60"
                    : "border-line hover:border-ink/40",
                )}
              >
                <span className="text-lg tracking-tight text-ink">{service.title}</span>
                <span className="text-sm text-ink-2">
                  {service.durationMinutes} {t("common.minutes")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {recommendation.urgency === "urgent" && (
        <div className="flex items-start gap-3 border-l-2 border-clay bg-clay/5 px-5 py-4">
          <span aria-hidden className="mt-1 text-clay">
            ▲
          </span>
          <p className="text-sm leading-relaxed text-ink">{t("booking.recommendation.urgentNote")}</p>
        </div>
      )}

      {answerEntries.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="label-eyebrow">{t("booking.summary.toldUs")}</span>
          <dl className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
            {answerEntries.map(([key, value]) => (
              <div key={key} className="flex items-baseline justify-between gap-4 border-b border-line py-2">
                <dt className="text-xs text-ink-2">{questionLabel(key)}</dt>
                <dd className="text-right text-sm text-ink">{questionValue(key, value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => {
            if (effective) {
              set({ selectedServiceSlug: effective.slug });
              onAccepted?.(recommendation.serviceSlug);
            }
            go("doctor");
          }}
          className="btn btn-primary"
        >
          {t("booking.recommendation.continue")}
        </button>
        <button type="button" onClick={() => go("questions")} className="btn btn-quiet">
          {t("booking.questions.back")}
        </button>
      </div>
    </div>
  );
}

export function DoctorSelector({
  state,
  set,
  go,
  doctors,
}: StepApi & { doctors: BookingDoctor[] }) {
  const { t, tList } = useI18n();
  const weekdays = tList("common.weekdaysShort");
  const serviceSlug = state.selectedServiceSlug;
  const eligible = doctors.filter((doctor) =>
    serviceSlug ? doctor.serviceSlugs.includes(serviceSlug) : true,
  );
  const anyActive = state.doctorId === "any";

  if (eligible.length === 0) {
    return (
      <div className="step-enter flex flex-col gap-6">
        <p className="max-w-lg text-lg text-ink">{t("booking.doctor.none")}</p>
        <button type="button" onClick={() => go("recommendation")} className="btn btn-quiet">
          {t("booking.questions.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="step-enter flex flex-col gap-8">
      <button
        type="button"
        onClick={() => set({ doctorId: "any", day: null, startMinute: null, assignedDoctorId: null })}
        aria-pressed={anyActive}
        className={cn(
          "flex flex-col gap-2 border p-6 text-left transition-colors sm:flex-row sm:items-center sm:justify-between",
          anyActive ? "border-forest bg-canvas-2/60" : "border-line hover:border-ink/40",
        )}
      >
        <span className="flex flex-col gap-1">
          <span className="text-xl tracking-tight text-ink">{t("booking.doctor.any")}</span>
          <span className="text-sm text-ink-2">{t("booking.doctor.anyNote")}</span>
        </span>
        <span className="section-index">{eligible.length}</span>
      </button>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eligible.map((doctor, index) => {
          const active = state.doctorId === doctor.id;
          return (
            <button
              key={doctor.id}
              type="button"
              onClick={() =>
                set({ doctorId: doctor.id, day: null, startMinute: null, assignedDoctorId: doctor.id })
              }
              aria-pressed={active}
              className={cn(
                "flex h-full flex-col gap-4 border p-6 text-left transition-colors",
                active ? "border-forest bg-canvas-2/60" : "border-line hover:border-ink/40",
              )}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="section-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-[0.65rem] tracking-[0.16em] text-forest uppercase">
                  {active ? t("booking.doctor.selected") : t("booking.doctor.select")}
                </span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-lg tracking-tight text-ink">{doctor.name}</span>
                <span className="editorial-serif text-base text-forest-2">{doctor.title}</span>
              </span>
              <span className="text-sm leading-relaxed text-ink-2">{doctor.bio}</span>
              <span className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
                <span className="flex items-center justify-between gap-3 text-xs">
                  <span className="label-eyebrow">{t("home.doctors.experience")}</span>
                  <span className="text-sm text-ink">
                    {doctor.experienceYears ?? t("common.notConfigured")}
                  </span>
                </span>
                <span className="flex items-center justify-between gap-3">
                  <span className="label-eyebrow">{t("home.doctors.schedule")}</span>
                  <span className="flex gap-1.5">
                    {weekdays.map((day, position) => (
                      <span
                        key={day}
                        className={cn(
                          "text-[0.65rem]",
                          doctor.weekdayBits & (1 << position) ? "text-forest" : "text-sage-2",
                        )}
                      >
                        {day}
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <button type="button" onClick={() => go("datetime")} className="btn btn-primary">
          {t("booking.questions.continue")}
        </button>
        <button type="button" onClick={() => go("recommendation")} className="btn btn-quiet">
          {t("booking.questions.back")}
        </button>
      </div>
    </div>
  );
}
