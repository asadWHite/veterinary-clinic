"use client";

import Image from "next/image";
import Link from "next/link";
import { useBooking } from "@/components/booking/BookingContext";
import { assetById, speciesMeta, speciesInfo, type SpeciesKey } from "@/data/animals";
import { longDateL, durationLabelL } from "@/lib/format";

export function BookingConfirmation() {
  const { state, doctors, recommendation, reset , t, locale } = useBooking();
  const result = state.result;
  if (!result) return null;

  const species = (typeof state.answers.species === "string" ? state.answers.species : "dog") as SpeciesKey;
  const asset = assetById(speciesMeta[species].assetId);
  const info = speciesInfo(species, locale);
  const doctor = doctors.find((d) => d.id === state.doctorId);

  return (
    <div className="hero-rise">
      <p className="label text-forest">{t("booking.confirmation.confirmed")}</p>
      <h1 className="display d1 mt-6 uppercase">
        {t("booking.confirmation.title1")}
        <br />
        {t("booking.confirmation.title2")}
      </h1>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Image
            src={asset.src}
            alt={asset.alt}
            width={1024}
            height={1024}
            priority
            sizes="(max-width: 1024px) 90vw, 40vw"
            className="h-auto w-full select-none"
            style={{ mixBlendMode: "multiply" }}
          />
        </div>

        <div className="lg:col-span-7">
          <dl className="border-t border-[var(--line)]">
            {[
              { label: t("booking.confirmation.companion"), value: result.petName },
              { label: t("booking.confirmation.care"), value: result.serviceName },
              { label: t("booking.confirmation.clinician"), value: doctor ? doctor.name : t("notAvailable") },
              { label: t("booking.confirmation.date"), value: longDateL(result.date, locale) },
              { label: t("booking.confirmation.time"), value: result.startTime },
              { label: t("booking.confirmation.duration"), value: durationLabelL(result.durationMinutes, locale) },
              { label: t("booking.confirmation.status"), value: t("booking.confirmation.confirmed") },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-6 border-b border-[var(--line)] py-4"
              >
                <dt className="label text-ink/40">{row.label}</dt>
                <dd className="display d5 uppercase">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 border border-[var(--line)] p-5">
            <p className="label text-ink/40">{t("booking.confirmation.appointmentId")}</p>
            <p className="mono-num mt-2 text-xl font-bold tracking-[0.12em]">{result.publicId}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink/55">
              {t("booking.confirmation.keepReference")}
            </p>
          </div>

          {recommendation.urgency === "urgent" ? (
            <div className="mt-6 border-l-2 border-forest bg-forest/[0.05] p-5">
              <p className="label text-forest">{t("booking.confirmation.alsoCall")}</p>
              <p className="body-lg mt-2">{recommendation.safety}</p>
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={`/appointments/${result.publicId}`}
              className="label arrow-forward flex items-center gap-3 bg-ink px-8 py-5 text-white transition-colors hover:bg-forest"
            >
              {t("booking.confirmation.viewAppointment")}
              <span className="arrow">→</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                reset();
                window.location.href = "/";
              }}
              className="label px-2 py-4 text-ink/55 hover:text-ink"
            >
              {t("common.backHome")}
            </button>
          </div>

          <p className="label mt-10 max-w-md leading-[1.9] text-ink/35">
            {t("booking.confirmation.emailNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
