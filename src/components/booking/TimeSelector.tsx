"use client";

import { useEffect, useState } from "react";
import { useBooking } from "@/components/booking/BookingContext";
import { DateSelector } from "@/components/booking/DateSelector";
import { AvailabilityGrid } from "@/components/booking/AvailabilityGrid";
import type { AvailabilityResponse, DayAvailabilityDto } from "@/types/booking";
import { longDateL, durationLabelL } from "@/lib/format";
import { specialtyOf } from "@/data/doctors";
import { pickL } from "@/i18n/localized";
import { todayISO } from "@/lib/format";

export function TimeSelector() {
  const { state, recommendation, doctors, setField, back, next , t, locale } = useBooking();
  const activeSlug = state.serviceSlug ?? recommendation.serviceSlug;
  const doctor = doctors.find((d) => d.id === state.doctorId);

  const [days, setDays] = useState<Record<string, DayAvailabilityDto>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(state.date);

  useEffect(() => {
    if (!state.doctorId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/availability?doctorId=${state.doctorId}&service=${activeSlug}&days=14`, {
      cache: "no-store",
    })
      .then((res) => res.json() as Promise<AvailabilityResponse>)
      .then((data) => {
        if (cancelled) return;
        setDays(data.days ?? {});
        setLoading(false);
        const first = Object.keys(data.days ?? {})
          .sort()
          .find((d) => (data.days?.[d]?.freeCount ?? 0) > 0);
        if (first) setSelectedDate((prev) => prev ?? first);
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [state.doctorId, activeSlug]);

  const list = Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
  const activeDay = selectedDate ? days[selectedDate] : undefined;

  return (
    <div className="hero-rise">
      <p className="label text-ink/40">{t("booking.time.eyebrow")}</p>
      <h1 className="display d3 mt-5 uppercase">
        {t("booking.time.title1")}
        <br />
        {t("booking.time.title2")}
      </h1>
      <p className="body-lg mt-5 max-w-xl">
        {t("booking.time.prompt", {
          doctor: doctor ? doctor.name : "",
          specialty: doctor ? specialtyOf(doctor.slug, locale) : "",
          duration: durationLabelL(recommendation.durationMinutes, locale),
        })}
      </p>

      {loading ? (
        <div className="mt-10 flex gap-0 overflow-hidden border-y border-[var(--line)]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="min-w-[86px] animate-pulse border-r border-[var(--line)] px-4 py-5">
              <div className="h-2 w-8 bg-ink/10" />
              <div className="mt-3 h-6 w-8 bg-ink/10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <DateSelector
            days={list}
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setField("date", date);
              setField("time", null);
            }}
          />
        </div>
      )}

      <div className="mt-10">
        {activeDay ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--line)] pb-3">
              <p className="display d5 uppercase">{longDateL(activeDay.date, locale)}</p>
              <p className="label mono-num text-ink/40">
                {activeDay.freeCount === 1
                  ? t("booking.time.slotOpen")
                  : t("booking.time.slotsOpen", { count: activeDay.freeCount })}
              </p>
            </div>
            <div className="mt-8">
              <AvailabilityGrid
                day={activeDay}
                selected={state.time}
                onSelect={(time) => setField("time", time)}
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-8">
        <button type="button" onClick={back} className="label px-2 py-4 text-ink/50 hover:text-ink">
          {t("common.back")}
        </button>
        <button
          type="button"
          disabled={!state.time}
          onClick={next}
          className="label arrow-forward ml-auto flex items-center gap-3 bg-ink px-8 py-5 text-white transition-colors hover:bg-forest disabled:cursor-not-allowed disabled:opacity-30"
        >
          {t("booking.time.confirmDetails")}
          <span className="arrow">→</span>
        </button>
      </div>

      {selectedDate && selectedDate < todayISO() ? (
        <p className="label mt-4 text-forest">{t("booking.time.passedDay")}</p>
      ) : null}
    </div>
  );
}
