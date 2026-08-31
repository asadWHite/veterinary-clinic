"use client";

import Link from "next/link";
import { useBooking } from "@/components/booking/BookingContext";
import { longDateL, durationLabelL } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";

export function BookingDetails() {
  const { state, doctors, recommendation, isGuest, setOwner, setPet, submit, back , t, locale } = useBooking();
  const doctor = doctors.find((d) => d.id === state.doctorId);

  return (
    <div className="hero-rise">
      <p className="label text-ink/40">{t("booking.details.eyebrow")}</p>
      <h1 className="display d3 mt-5 uppercase">
        {t("booking.details.title1")}
        <br />
        {t("booking.details.title2")}
      </h1>
      <p className="body-lg mt-5 max-w-xl">
        {isGuest ? t("booking.details.guestPrompt") : t("booking.details.userPrompt")}
      </p>

      <form
        className="mt-10 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Field
          id="owner-name"
          label={t("booking.details.yourName")}
          value={state.owner.name}
          onChange={(v) => setOwner("name", v)}
          required
          autoComplete="name"
        />
        <Field
          id="owner-phone"
          label={t("booking.details.phone")}
          type="tel"
          value={state.owner.phone}
          onChange={(v) => setOwner("phone", v)}
          required
          autoComplete="tel"
          placeholder="[PHONE]"
        />
        <Field
          id="owner-email"
          label={t("booking.details.email")}
          type="email"
          value={state.owner.email}
          onChange={(v) => setOwner("email", v)}
          autoComplete="email"
          placeholder="[EMAIL]"
        />
        <Field
          id="pet-name"
          label={t("booking.details.companionName")}
          value={state.petName}
          onChange={(v) => setPet(null, v)}
          required
          placeholder="Rex"
        />

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="label text-ink/45">
            {t("booking.details.anythingToAdd")}
          </label>
          <textarea
            id="notes"
            rows={4}
            value={state.owner.notes}
            onChange={(e) => setOwner("notes", e.target.value)}
            placeholder={t("booking.details.notesPlaceholder")}
            className="mt-3 w-full resize-none border border-[var(--line)] bg-canvas p-4 text-[0.95rem] leading-relaxed outline-none transition-colors focus:border-ink"
          />
        </div>

        <div className="sm:col-span-2 border-t border-[var(--line)] pt-6">
          <p className="label text-ink/40">{t("booking.details.summary")}</p>
          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            <SummaryCell label={t("booking.summary.care")} value={recommendation.serviceName} />
            <SummaryCell label={t("booking.summary.clinician")} value={doctor?.name ?? t("notAvailable")} />
            <SummaryCell label={t("booking.summary.date")} value={state.date ? longDateL(state.date, locale) : t("notAvailable")} />
            <SummaryCell
              label={t("booking.summary.time")}
              value={`${state.time ?? t("notAvailable")} · ${durationLabelL(recommendation.durationMinutes, locale)}`}
            />
          </div>
        </div>

        {state.error ? (
          <div
            role="alert"
            className="sm:col-span-2 border-l-2 border-forest bg-forest/[0.06] p-5"
          >
            <p className="label text-forest">{state.error}</p>
            {state.error.toLowerCase().includes("booked") || state.error.toLowerCase().includes("band") || state.error.toLowerCase().includes("занят") ? (
              <p className="mt-2 text-sm text-ink/60">{t("booking.details.justBooked")}</p>
            ) : null}
          </div>
        ) : null}

        <div className="sm:col-span-2 flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-6">
          <button type="button" onClick={back} className="label px-2 py-4 text-ink/50 hover:text-ink">
            ← Back
          </button>
          <button
            type="submit"
            disabled={state.submitting}
            className="label arrow-forward ml-auto flex items-center gap-3 bg-ink px-8 py-5 text-white transition-colors hover:bg-forest disabled:opacity-40"
          >
            {state.submitting ? t("booking.details.booking") : t("booking.details.confirm")}
            <span className="arrow">→</span>
          </button>
        </div>
      </form>

      <p className="label mt-8 max-w-lg leading-relaxed text-ink/35">
        By booking you agree to our{" "}
        <Link href="/terms" className="link-underline text-ink/60">
          terms
        </Link>
        . Clinic details, phone numbers and hours on this site are placeholders.
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  placeholder,
  readOnlyValue,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  readOnlyValue?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="label text-ink/45">
        {label}
        {required ? " *" : ""}
      </label>
      {readOnlyValue ? (
        <p className="mono-num mt-3 border-b border-ink/25 pb-3 text-lg font-bold">{value || "—"}</p>
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-3 w-full border-b border-ink/25 bg-transparent pb-3 text-lg font-semibold tracking-[-0.01em] outline-none transition-colors placeholder:text-ink/25 focus:border-ink"
        />
      )}
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label text-ink/40">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-snug">{value}</p>
    </div>
  );
}
