"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import { FormNote, Spinner, StatusPill } from "@/components/ui/Bits";
import { formatDateLong, icsTimestamp, minutesToTime } from "@/lib/format";
import type { StepApi } from "@/features/booking/steps/OpeningSteps";
import type { BookingDoctor, BookingService } from "@/features/booking/state";
import { useBookingLabels } from "@/features/booking/labels";
import type { AppointmentStatus } from "@/lib/types";

export function ClientStep({ state, set, go }: StepApi) {
  const { t } = useI18n();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (state.client.name.trim().length < 2) next.name = t("validation.required");
    const digits = (state.client.phone.match(/\d/g) ?? []).length;
    if (digits < 7) next.phone = t("validation.invalidPhone");
    if (state.client.email.trim() !== "" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.client.email.trim())) {
      next.email = t("validation.invalidEmail");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  return (
    <div className="step-enter flex flex-col gap-8">
      {!state.client.email && (
        <p className="max-w-lg text-sm leading-relaxed text-ink-2">{t("booking.client.lead")}</p>
      )}

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow">{t("booking.client.name")}</span>
          <input
            className="field-input"
            autoComplete="name"
            value={state.client.name}
            onChange={(event) => set({ client: { ...state.client, name: event.target.value } })}
          />
          {errors.name && <FormNote>{errors.name}</FormNote>}
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow">{t("booking.client.phone")}</span>
          <input
            className="field-input"
            inputMode="tel"
            autoComplete="tel"
            value={state.client.phone}
            onChange={(event) => set({ client: { ...state.client, phone: event.target.value } })}
          />
          {errors.phone && <FormNote>{errors.phone}</FormNote>}
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow">{t("booking.client.emailOptional")}</span>
          <input
            className="field-input"
            type="email"
            autoComplete="email"
            value={state.client.email}
            onChange={(event) => set({ client: { ...state.client, email: event.target.value } })}
          />
          {errors.email && <FormNote>{errors.email}</FormNote>}
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="label-eyebrow">
            {t("booking.client.notes")} <span className="normal-case">({t("common.optional")})</span>
          </span>
          <textarea
            rows={3}
            className="field-input resize-none"
            value={state.client.notes}
            onChange={(event) => set({ client: { ...state.client, notes: event.target.value } })}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => {
            if (validate()) go("summary");
          }}
          className="btn btn-primary"
        >
          {t("booking.questions.continue")}
        </button>
        <button type="button" onClick={() => go("datetime")} className="btn btn-quiet">
          {t("booking.questions.back")}
        </button>
      </div>
    </div>
  );
}

type CreateResponse = {
  ok?: boolean;
  publicId?: string;
  day?: string;
  startMinute?: number;
  durationMinutes?: number;
  status?: AppointmentStatus;
  doctorName?: string;
  serviceName?: string;
  petName?: string | null;
  error?: string;
};

export function SummaryStep({
  state,
  set,
  go,
  services,
  doctors,
  isAuthenticated,
  userId,
}: StepApi & {
  services: BookingService[];
  doctors: BookingDoctor[];
  isAuthenticated: boolean;
  userId: number | null;
}) {
  const { t, locale } = useI18n();
  const { questionLabel, questionValue } = useBookingLabels();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const service = services.find((item) => item.slug === state.selectedServiceSlug) ?? null;
  const doctor =
    state.doctorId === "any"
      ? doctors.find((item) => item.id === (state.assignedDoctorId ?? -1)) ?? null
      : doctors.find((item) => item.id === state.doctorId) ?? null;

  const answers = Object.entries(state.answers).filter(([, value]) => value.trim() !== "");

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale,
          serviceSlug: state.selectedServiceSlug,
          doctorSlug: state.doctorId === "any" ? "any" : doctor?.slug,
          day: state.day,
          startMinute: state.startMinute,
          species: state.species,
          lifeStage: state.lifeStage,
          reasonKey: state.reason ?? "other",
          answers: answers.map(([key, value]) => ({ key, value })),
          client: {
            name: state.client.name.trim(),
            phone: state.client.phone.trim(),
            email: state.client.email.trim(),
            notes: state.client.notes.trim(),
          },
          pet: {
            id: state.pet?.id,
            name: state.pet?.name,
            breed: state.pet?.breed,
            birthDate: state.pet?.birthDate,
            weightKg: state.pet?.weight ? Number(state.pet.weight) : undefined,
          },
        }),
      });

      if (response.status === 409) {
        setError("booking.errors.slotTaken");
        setSubmitting(false);
        return;
      }
      if (response.status === 503) {
        const data = (await response.json().catch(() => ({}))) as CreateResponse;
        if (data.error === "booking_offline") {
          setError("booking.errors.bookingOffline");
          setOffline(true);
        } else {
          setError("booking.errors.db");
        }
        setSubmitting(false);
        return;
      }
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as CreateResponse;
        setError(
          data.error === "validation" ? "booking.errors.validation" : "booking.errors.generic",
        );
        setSubmitting(false);
        return;
      }

      const data = (await response.json()) as CreateResponse;
      set({
        confirmation: {
          publicId: data.publicId ?? "",
          day: data.day ?? state.day ?? "",
          startMinute: data.startMinute ?? state.startMinute ?? 0,
          durationMinutes: data.durationMinutes ?? service?.durationMinutes ?? 30,
          doctorName: data.doctorName ?? doctor?.name ?? "",
          serviceName: data.serviceName ?? service?.title ?? "",
          petName: data.petName ?? state.pet?.name ?? "",
          status: data.status ?? "pending",
        },
        step: "confirmation",
      });
    } catch {
      setError("booking.errors.network");
    } finally {
      setSubmitting(false);
    }
  }

  const rows: { label: string; value: string }[] = [
    {
      label: t("booking.summary.pet"),
      value: `${state.pet?.name || t("common.guest")} · ${t(`species.${state.species}`)}${
        state.pet?.breed ? ` · ${state.pet.breed}` : ""
      } · ${t(`lifeStages.${state.lifeStage}`)}`,
    },
    { label: t("booking.summary.service"), value: service?.title ?? "—" },
    {
      label: t("booking.summary.doctor"),
      value: state.doctorId === "any" ? `${doctor?.name ?? t("booking.doctor.any")} — ${t("booking.datetime.assignedNote")}` : doctor?.name ?? "—",
    },
    {
      label: t("booking.summary.date"),
      value: state.day ? formatDateLong(state.day, locale) : "—",
    },
    {
      label: t("booking.summary.time"),
      value: state.startMinute !== null ? minutesToTime(state.startMinute) : "—",
    },
    {
      label: t("booking.summary.duration"),
      value: `${service?.durationMinutes ?? 0} ${t("common.minutesFull")}`,
    },
    { label: t("booking.summary.client"), value: state.client.name },
    {
      label: t("booking.summary.contact"),
      value: `${state.client.phone}${state.client.email ? ` · ${state.client.email}` : ""}`,
    },
  ];

  return (
    <div className="step-enter flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-x-14 lg:grid-cols-2">
        <dl className="flex flex-col">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
              <dt className="label-eyebrow">{row.label}</dt>
              <dd className="text-right text-sm text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col gap-3">
          <span className="label-eyebrow">{t("booking.summary.toldUs")}</span>
          {answers.length === 0 ? (
            <p className="text-sm text-ink-2">{t("admin.appointments.noAnswers")}</p>
          ) : (
            <ol className="flex flex-col">
              {answers.map(([key, value]) => (
                <li key={key} className="flex items-baseline justify-between gap-6 border-b border-line py-3">
                  <span className="text-xs text-ink-2">{questionLabel(key)}</span>
                  <span className="max-w-[60%] text-right text-sm text-ink">
                    {questionValue(key, value)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {state.client.notes.trim() !== "" && (
            <div className="mt-4 flex flex-col gap-2 border-l-2 border-sage pl-4">
              <span className="label-eyebrow">{t("booking.client.notes")}</span>
              <p className="text-sm leading-relaxed text-ink-2">{state.client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex flex-col gap-4 border-l-2 border-clay bg-clay/5 px-5 py-4">
          <span className="text-sm leading-relaxed text-ink">{t(error)}</span>
          <div className="flex flex-wrap gap-3">
            {error === "booking.errors.slotTaken" && (
              <button type="button" onClick={() => go("datetime")} className="btn btn-quiet !py-2.5">
                {t("booking.datetime.question")}
              </button>
            )}
            {offline && (
              <>
                <a href="tel:+998994064640" className="btn btn-primary !py-2.5">
                  +998 99 406 46 40
                </a>
                <a href="tel:+998987004640" className="btn btn-ghost !py-2.5">
                  +998 98 700 46 40
                </a>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={submit} disabled={submitting} className="btn btn-primary">
            {submitting ? (
              <>
                <Spinner /> {t("booking.summary.creating")}
              </>
            ) : (
              t("booking.summary.confirm")
            )}
          </button>
          <button type="button" onClick={() => go("client")} className="btn btn-quiet">
            {t("booking.questions.back")}
          </button>
        </div>
        <p className="max-w-xl text-xs leading-relaxed text-ink-2">{t("booking.summary.consent")}</p>
        {!isAuthenticated && (
          <p className="text-xs text-ink-2">
            {t("common.guest")} — {t("booking.client.guestNote")}
            {userId ? "" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export function Confirmation({
  state,
  go,
  isAuthenticated,
}: {
  state: StepApi["state"];
  go: StepApi["go"];
  isAuthenticated: boolean;
}) {
  const { t, locale } = useI18n();
  const confirmation = state.confirmation;

  if (!confirmation) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-ink">{t("booking.errors.notFound")}</p>
        <button type="button" onClick={() => go("animal")} className="btn btn-primary">
          {t("home.booking.start")}
        </button>
      </div>
    );
  }

  const end = confirmation.startMinute + confirmation.durationMinutes;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//veterinary-clinic//booking//EN",
    "BEGIN:VEVENT",
    `UID:${confirmation.publicId}`,
    `DTSTAMP:${icsTimestamp(confirmation.day, confirmation.startMinute)}`,
    `DTSTART:${icsTimestamp(confirmation.day, confirmation.startMinute)}`,
    `DTEND:${icsTimestamp(confirmation.day, end)}`,
    `SUMMARY:${confirmation.serviceName}`,
    `DESCRIPTION:${confirmation.doctorName} · ${confirmation.publicId}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return (
    <div className="step-enter flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <span className="label-eyebrow">{t("booking.confirmation.status")}</span>
        <h3 className="text-h2 font-normal tracking-tight text-ink">{t("booking.confirmation.title")}</h3>
        <p className="max-w-xl text-[0.98rem] leading-relaxed text-ink-2">
          {t("booking.confirmation.lead")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-14 border border-line bg-canvas-2/50 p-6 sm:p-10 lg:grid-cols-2">
        <dl className="flex flex-col">
          {[
            { label: t("booking.confirmation.bookingId"), value: confirmation.publicId },
            { label: t("booking.summary.service"), value: confirmation.serviceName },
            { label: t("booking.summary.doctor"), value: confirmation.doctorName },
            {
              label: t("booking.summary.pet"),
              value: confirmation.petName || t("common.guest"),
            },
          ].map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-line py-3">
              <dt className="label-eyebrow">{row.label}</dt>
              <dd className="text-right text-sm text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
        <dl className="flex flex-col">
          {[
            {
              label: t("booking.summary.date"),
              value: formatDateLong(confirmation.day, locale),
            },
            { label: t("booking.summary.time"), value: minutesToTime(confirmation.startMinute) },
            {
              label: t("booking.summary.duration"),
              value: `${confirmation.durationMinutes} ${t("common.minutesFull")}`,
            },
          ].map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-line py-3">
              <dt className="label-eyebrow">{row.label}</dt>
              <dd className="text-right text-sm text-ink">{row.value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-6 py-3">
            <dt className="label-eyebrow">{t("booking.confirmation.status")}</dt>
            <dd>
              <StatusPill status="pending" label={t("statuses.pending")} />
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <a
          className="btn btn-ghost"
          download={`${confirmation.publicId}.ics`}
          href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`}
        >
          {t("booking.confirmation.addToCalendar")}
        </a>
        {isAuthenticated ? (
          <Link href={`/${locale}/account/appointments`} className="btn btn-quiet">
            {t("booking.confirmation.viewAppointment")}
          </Link>
        ) : (
          <Link href={`/${locale}/register`} className="btn btn-quiet">
            {t("booking.confirmation.createAccount")}
          </Link>
        )}
        <Link href={`/${locale}`} className="btn btn-quiet">
          {t("booking.confirmation.backHome")}
        </Link>
      </div>

      {!isAuthenticated && (
        <p className="max-w-xl text-xs leading-relaxed text-ink-2">
          {t("booking.confirmation.accountOffer")}
        </p>
      )}
    </div>
  );
}

export function BookingTitleRow({
  title,
  lead,
  stepLabel,
}: {
  title: string;
  lead: string;
  stepLabel: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4")}>
      <span className="label-eyebrow">{stepLabel}</span>
      <h2 className="text-h1 font-normal tracking-tight text-ink">{title}</h2>
      <p className="max-w-2xl text-[0.98rem] leading-relaxed text-ink-2">{lead}</p>
    </div>
  );
}
