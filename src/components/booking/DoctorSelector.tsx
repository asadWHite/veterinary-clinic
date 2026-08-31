"use client";

import Link from "next/link";
import { useBooking } from "@/components/booking/BookingContext";
import { DoctorPortrait } from "@/components/doctors/DoctorPortrait";
import { FavoriteToggle } from "@/components/doctors/FavoriteToggle";
import { shortDateL } from "@/lib/format";
import { specialtyOf } from "@/data/doctors";

export function DoctorSelector() {
  const { state, doctors, recommendation, setField, next, back, isGuest , t, locale } = useBooking();

  const sorted = [...doctors].sort((a, b) => {
    const score = (d: typeof a) =>
      d.specialization === recommendation.focusSpecialty ? 0 : 1;
    return score(a) - score(b);
  });

  return (
    <div className="hero-rise">
      <p className="label text-ink/40">{t("booking.doctor.eyebrow")}</p>
      <h1 className="display d3 mt-5 uppercase">
        {t("booking.doctor.title1")}
        <br />
        {t("booking.doctor.title2")}
        <br />
        {t("booking.doctor.title3")}
      </h1>
      <p className="body-lg mt-5 max-w-xl">
        {t("booking.doctor.prompt", { specialty: recommendation.focusSpecialty })}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((doctor) => {
          const selected = state.doctorId === doctor.id;
          const matches = doctor.specialization === recommendation.focusSpecialty;
          const species = typeof state.answers.species === "string" ? state.answers.species : "dog";
          const treatsSpecies = doctor.speciesFocus.includes(species);
          return (
            <div
              key={doctor.id}
              className={`group relative flex flex-col border transition-colors duration-500 ${
                selected ? "border-ink bg-paper" : "border-transparent hover:border-[var(--line)]"
              }`}
            >
              <button
                type="button"
                onClick={() => setField("doctorId", doctor.id)}
                aria-pressed={selected}
                className="press text-left"
              >
                <div className="overflow-hidden">
                  <DoctorPortrait
                    doctor={doctor}
                    className="aspect-[4/5] w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3 border-t border-[var(--line)] pt-3">
                  <div>
                    <p className="label text-ink/35">{doctor.code}</p>
                    <p className="display d5 mt-2 uppercase">{doctor.name}</p>
                    <p className="mt-2 text-[0.8rem] leading-snug text-ink/55">
                      {specialtyOf(doctor.slug, locale)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="label text-ink/35">{t("booking.doctor.nextAvailable")}</p>
                    <p className="mono-num mt-2 text-sm font-bold">
                      {doctor.next ? doctor.next.time : "—"}
                    </p>
                    <p className="label text-ink/35">{doctor.next ? shortDateL(doctor.next.date, locale) : t("booking.doctor.full")}</p>
                  </div>
                </div>
              </button>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="label text-forest">{matches ? t("booking.doctor.bestMatch") : t("booking.doctor.available")}</span>
                {!treatsSpecies ? (
                  <span className="label text-ink/35">{t("booking.doctor.confirmSpecies")}</span>
                ) : null}
                {!isGuest ? <FavoriteToggle doctorId={doctor.id} /> : null}
              </div>

              {selected ? (
                <button
                  type="button"
                  onClick={next}
                  className="label arrow-forward mt-4 flex items-center justify-between gap-3 bg-ink px-5 py-4 text-white"
                >
                  {t("booking.doctor.continueWith", { name: doctor.name })}
                  <span className="arrow">→</span>
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-8">
        <button type="button" onClick={back} className="label px-2 py-4 text-ink/50 hover:text-ink">
          {t("common.back")}
        </button>
        <button
          type="button"
          disabled={!state.doctorId}
          onClick={next}
          className="label arrow-forward ml-auto flex items-center gap-3 bg-ink px-8 py-5 text-white transition-colors hover:bg-forest disabled:cursor-not-allowed disabled:opacity-30"
        >
          {t("booking.doctor.chooseTime")}
          <span className="arrow">→</span>
        </button>
      </div>

      <p className="label mt-6 text-ink/35">
        <Link href="/doctors" className="link-underline text-ink/60">
          {t("booking.doctor.fullList")}
        </Link>
      </p>
    </div>
  );
}
