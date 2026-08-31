"use client";

import Image from "next/image";
import { useBooking } from "@/components/booking/BookingContext";
import { urgencyMeta } from "@/data/recommendations";
import { assetById, speciesMeta, speciesInfo, type SpeciesKey } from "@/data/animals";
import { longDateL, durationLabelL, shortDateL } from "@/lib/format";
import { pickL } from "@/i18n/localized";

/** Live summary. The companion never leaves the screen. */
export function BookingSummary({ compact = false }: { compact?: boolean }) {
  const { state, doctors, recommendation , t, locale } = useBooking();
  const species = (typeof state.answers.species === "string" ? state.answers.species : "dog") as SpeciesKey;
  const petAsset = assetById(speciesMeta[species].assetId);
  const info = speciesInfo(species, locale);
  const serviceName =
    recommendation.serviceName +
    (state.serviceSlug && state.serviceSlug !== recommendation.serviceSlug
      ? ` ${t("booking.summary.changed")}`
      : "");
  const doctor = doctors.find((d) => d.id === state.doctorId);

  if (compact) {
    return (
      <div className="sticky top-16 z-30 flex items-center gap-4 border-b border-[var(--line)] bg-canvas/95 px-[var(--gutter)] py-3 backdrop-blur-[6px] lg:hidden">
        <span className="relative h-12 w-12 shrink-0">
          <Image
            src={petAsset.src}
            alt=""
            width={128}
            height={128}
            sizes="48px"
            className="h-full w-full object-contain"
            style={{ mixBlendMode: "multiply" }}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="display d5 truncate uppercase">{state.petName || info.label}</p>
          <p className="label truncate text-ink/45">
            {serviceName}
            {state.time ? ` · ${state.time}` : ""}
          </p>
        </div>
        {state.time ? (
          <span className="label border border-[var(--line)] px-3 py-2 text-ink/60">
            {state.date ? shortDateL(state.date, locale) : ""} {state.time}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="border-t border-[var(--line)]">
      <p className="label pt-5 text-ink/40">{t("booking.summary.title")}</p>
      <dl className="mt-5 space-y-4">
        <Row label={t("booking.summary.companion")}>
          {state.petName || info.label}
          {state.petBreed ? ` · ${state.petBreed}` : ""}
        </Row>
        <Row label={t("booking.summary.care")}>{serviceName}</Row>
        <Row label={t("common.duration")}>{durationLabelL(recommendation.durationMinutes, locale)}</Row>
        <Row label={t("booking.summary.clinician")}>{doctor ? `${doctor.name}` : t("notAvailable")}</Row>
        <Row label={t("booking.summary.date")}>{state.date ? longDateL(state.date, locale) : t("notAvailable")}</Row>
        <Row label={t("booking.summary.time")}>{state.time ?? t("notAvailable")}</Row>
        <Row label={t("booking.summary.urgency")}>{t(urgencyMeta[recommendation.urgency].labelKey)}</Row>
      </dl>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-3">
      <dt className="label text-ink/40">{label}</dt>
      <dd className="max-w-[62%] text-right text-sm font-semibold tracking-[-0.01em]">{children}</dd>
    </div>
  );
}
