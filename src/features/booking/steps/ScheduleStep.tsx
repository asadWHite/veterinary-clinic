"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/Bits";
import { BOOKING_HORIZON_DAYS, bookingDayRange, minutesToTime, nowInZone } from "@/lib/format";
import type { AvailabilitySlot } from "@/lib/types";
import type { StepApi } from "@/features/booking/steps/OpeningSteps";
import type { BookingDoctor } from "@/features/booking/state";

type DaySummary = { day: string; availableCount: number; doctorIds: number[] };

export function DateTimeStep({
  state,
  set,
  go,
  doctors,
  timezone,
}: StepApi & { doctors: BookingDoctor[]; timezone: string }) {
  const { t, locale } = useI18n();
  const serviceSlug = state.selectedServiceSlug ?? "";
  const doctorSlug =
    state.doctorId === "any" ? "any" : doctors.find((doctor) => doctor.id === state.doctorId)?.slug ?? "any";

  const today = useMemo(() => nowInZone(timezone).day, [timezone]);
  const days = useMemo(() => bookingDayRange(today, BOOKING_HORIZON_DAYS), [today]);

  const [summary, setSummary] = useState<DaySummary[] | null>(null);
  const [offline, setOffline] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [loadingDays, setLoadingDays] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoadingDays(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/availability?service=${encodeURIComponent(serviceSlug)}&doctor=${encodeURIComponent(doctorSlug)}&range=${BOOKING_HORIZON_DAYS}&from=${today}&locale=${locale}`,
      );
      if (!response.ok) throw new Error("failed");
      const data = (await response.json()) as { days: DaySummary[]; offline?: boolean };
      setSummary(data.days ?? []);
      setOffline(Boolean(data.offline));
    } catch {
      setError("booking.datetime.error");
    } finally {
      setLoadingDays(false);
    }
  }, [serviceSlug, doctorSlug, today, locale]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (!state.day) {
      setSlots(null);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setError(null);
    (async () => {
      try {
        const response = await fetch(
          `/api/availability?service=${encodeURIComponent(serviceSlug)}&doctor=${encodeURIComponent(doctorSlug)}&day=${state.day}&locale=${locale}`,
        );
        if (!response.ok) throw new Error("failed");
        const data = (await response.json()) as { slots: AvailabilitySlot[]; offline?: boolean };
        if (!cancelled) {
          setSlots(data.slots ?? []);
          setOffline(Boolean(data.offline));
        }
      } catch {
        if (!cancelled) setError("booking.datetime.error");
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.day, serviceSlug, doctorSlug, locale]);

  const selectedDay = state.day ?? days.find((day) => (summary?.find((item) => item.day === day)?.availableCount ?? 0) > 0) ?? null;

  function dayFormatter(day: string) {
    return new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-GB", {
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${day}T00:00:00Z`));
  }

  function weekdayFormatter(day: string) {
    return new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-GB", {
      weekday: "short",
      timeZone: "UTC",
    }).format(new Date(`${day}T00:00:00Z`));
  }

  const hasAnyAvailability = (summary ?? []).some((day) => day.availableCount > 0);

  // Auto-select the first day that actually has free time.
  useEffect(() => {
    if (summary === null || state.day) return;
    const firstAvailable = summary.find((day) => day.availableCount > 0);
    if (firstAvailable) {
      set({ day: firstAvailable.day });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  return (
    <div className="step-enter flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="label-eyebrow">{t("booking.datetime.lead")}</span>
        <span className="text-xs text-ink-2">{timezone.replace("_", " ")}</span>
      </div>

      {loadingDays && (
        <div className="flex items-center gap-3 text-sm text-ink-2">
          <Spinner /> {t("booking.datetime.loading")}
        </div>
      )}

      {error && !loadingDays && (
        <div className="flex flex-wrap items-center gap-4 border-l-2 border-clay bg-clay/5 px-5 py-4">
          <span className="text-sm text-ink">{t("booking.datetime.error")}</span>
          <button type="button" onClick={() => void loadSummary()} className="btn btn-quiet !py-2">
            {t("booking.datetime.retry")}
          </button>
        </div>
      )}

      {summary && (
        <>
          {!hasAnyAvailability && !loadingDays && (
            <p className="max-w-xl text-sm leading-relaxed text-ink-2">{t("booking.datetime.noSlots")}</p>
          )}

          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
            {days.map((day) => {
              const info = summary.find((item) => item.day === day);
              const available = (info?.availableCount ?? 0) > 0;
              const active = state.day === day;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={!available}
                  onClick={() => set({ day, startMinute: null })}
                  aria-pressed={active}
                  className={cn(
                    "flex min-w-[4.6rem] shrink-0 flex-col items-start gap-1 border px-3 py-3 transition-colors",
                    active
                      ? "border-forest bg-forest text-canvas"
                      : available
                        ? "border-line text-ink hover:border-forest"
                        : "border-line/60 text-sage",
                  )}
                >
                  <span className="text-[0.6rem] tracking-[0.14em] uppercase opacity-70">
                    {weekdayFormatter(day)}
                  </span>
                  <span className="text-lg leading-none">{dayFormatter(day)}</span>
                  <span
                    aria-hidden
                    className={cn("mt-1 h-1 w-1 rounded-full", available ? "bg-clay" : "bg-transparent")}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-5 border-y border-line py-3 text-[0.65rem] tracking-[0.14em] text-ink-2 uppercase">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 border border-forest" aria-hidden /> {t("booking.datetime.legendAvailable")}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 border border-line bg-sage-2" aria-hidden /> {t("booking.datetime.legendBooked")}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 border border-line" aria-hidden /> {t("booking.datetime.legendPast")}
            </span>
          </div>

          {(loadingSlots || slots === null) && selectedDay && (
            <div className="flex items-center gap-3 text-sm text-ink-2">
              <Spinner /> {t("booking.datetime.loading")}
            </div>
          )}

          {slots !== null && selectedDay && (
            <div className="flex flex-col gap-5">
              {slots.length === 0 ? (
                <p className="text-sm text-ink-2">{t("booking.datetime.noSlots")}</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {slots.map((slot) => {
                    const selectable = slot.state === "available";
                    const active = state.startMinute === slot.minute;
                    return (
                      <button
                        key={slot.minute}
                        type="button"
                        disabled={!selectable}
                        onClick={() => {
                          set({
                            startMinute: slot.minute,
                            assignedDoctorId: slot.doctorIds[0] ?? state.assignedDoctorId,
                          });
                          go("client");
                        }}
                        aria-pressed={active}
                        title={
                          selectable
                            ? slot.label
                            : slot.state === "booked"
                              ? t("booking.datetime.legendBooked")
                              : slot.state === "past"
                                ? t("booking.datetime.legendPast")
                                : t("booking.datetime.slotUnavailable")
                        }
                        className={cn(
                          "border py-3 text-sm transition-colors",
                          active
                            ? "border-forest bg-forest text-canvas"
                            : selectable
                              ? "border-line text-ink hover:border-forest"
                              : "border-line/60 text-sage line-through",
                        )}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {state.startMinute !== null && (
                <p className="text-sm text-ink-2">
                  {minutesToTime(state.startMinute)} · {t("booking.datetime.minutes")}
                </p>
              )}
            </div>
          )}
        </>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => go("doctor")}
          className="link-underline text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase"
        >
          ← {t("booking.questions.back")}
        </button>
        {state.startMinute !== null && (
          <button type="button" onClick={() => go("client")} className="btn btn-primary">
            {t("booking.questions.continue")}
          </button>
        )}
      </div>
    </div>
  );
}
