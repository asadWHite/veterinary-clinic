"use client";

import { useEffect, useState } from "react";
import { useBooking } from "@/components/booking/BookingContext";
import { DateSelector } from "@/components/booking/DateSelector";
import { AvailabilityGrid } from "@/components/booking/AvailabilityGrid";
import type { AvailabilityResponse, DayAvailabilityDto } from "@/types/booking";
import { longDateL, durationLabelL, todayISO } from "@/lib/format";
import { specialtyOf } from "@/data/doctors";

export function TimeSelector() {
  const { state, recommendation, doctors, setField, back, next, t, locale } = useBooking();
  const activeSlug = state.serviceSlug ?? recommendation.serviceSlug;
  const doctor = doctors.find((d) => d.id === state.doctorId);

  const [days, setDays] = useState<Record<string, DayAvailabilityDto>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!state.doctorId) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    fetch(`/api/availability?doctorId=${state.doctorId}&service=${activeSlug}&days=14`, {
      cache: "no-store",
    })
      .then((res) =>
        res.ok
          ? (res.json() as Promise<AvailabilityResponse>)
          : Promise.reject(new Error(String(res.status))),
      )
      .then((data) => {
        if (cancelled) return;
        const nextDays = data.days ?? {};
        setDays(nextDays);
        setLoading(false);
        if (data.status && data.status !== "ok") setLoadError(true);

        /**
         * Auto-pick the first day that still has room — and write it into the
         * booking state, not only into local state. Previously the day was
         * highlighted on screen but `state.date` stayed empty, so the summary
         * showed "—" and submitting failed with "choose a date".
         */
        const ordered = Object.keys(nextDays).sort();
        const firstFree = ordered.find((d) => (nextDays[d]?.freeCount ?? 0) > 0);
        const firstOpen = ordered.find((d) => nextDays[d]?.open);
        const wanted = firstFree ?? firstOpen ?? null;
        if (wanted !== state.date) setField("date", wanted);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // `state.date` is deliberately not a dependency: re-fetching on every day
    // change would fight the user's own selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.doctorId, activeSlug, reloadKey]);

  const list = Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
  const activeDay = state.date ? days[state.date] : undefined;

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
      ) : list.length > 0 ? (
        <div className="mt-10">
          <DateSelector
            days={list}
            selected={state.date}
            onSelect={(date) => setField("date", date)}
          />
        </div>
      ) : (
        /* Nothing came back: say so, instead of leaving a blank rail that
           looks like "this clinic is fully booked". */
        <div className="mt-10 border border-[var(--line)] p-10 text-center">
          <p className="display d5 uppercase">
            {loadError ? t("booking.time.loadErrorTitle") : t("booking.time.noScheduleTitle")}
          </p>
          <p className="label mt-3 leading-[1.9] text-ink/40">
            {loadError ? t("booking.time.loadErrorBody") : t("booking.time.noScheduleBody")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="label arrow-forward flex items-center gap-3 bg-ink px-6 py-4 text-white"
            >
              {t("common.retry")}
              <span className="arrow">→</span>
            </button>
            <button type="button" onClick={back} className="label px-2 py-4 text-ink/50 hover:text-ink">
              {t("booking.time.pickAnotherClinician")}
            </button>
          </div>
        </div>
      )}

      <div className="mt-10">
        {activeDay ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--line)] pb-3">
              <p className="display d5 uppercase">{longDateL(activeDay.date, locale)}</p>
              <p className="label mono-num text-ink/40">
                {activeDay.freeCount > 1
                  ? t("booking.time.slotsOpen", { count: activeDay.freeCount })
                  : activeDay.freeCount === 1
                    ? t("booking.time.slotOpen")
                    : activeDay.open
                      ? t("booking.time.fullyBooked")
                      : t("booking.time.closed")}
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

      {state.date && state.date < todayISO() ? (
        <p className="label mt-4 text-forest">{t("booking.time.passedDay")}</p>
      ) : null}
    </div>
  );
}
