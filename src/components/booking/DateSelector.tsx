"use client";

import type { DayAvailabilityDto } from "@/types/booking";
import { weekdayShortL, monthShortL, dayNumber, relativeDayL } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";

/** Horizontal date rail — a scrollable editorial strip, not a calendar grid. */
export function DateSelector({
  days,
  selected,
  onSelect,
}: {
  days: DayAvailabilityDto[];
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  const { t, locale } = useI18n();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="label text-ink/40">{t("booking.time.chooseDay")}</p>
        <p className="label text-ink/30 hidden sm:block">{t("booking.time.swipe")}</p>
      </div>
      <div
        role="radiogroup"
        aria-label="Date"
        className="hide-scroll -mx-[var(--gutter)] mt-4 flex snap-x snap-mandatory gap-0 overflow-x-auto border-y border-[var(--line)] px-[var(--gutter)]"
      >
        {days.map((day) => {
          const isSelected = selected === day.date;
          const relative = relativeDayL(day.date, locale);
          return (
            <button
              key={day.date}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!day.open}
              onClick={() => onSelect(day.date)}
              className={`press group relative flex min-w-[86px] shrink-0 snap-start flex-col items-start gap-1 border-r border-[var(--line)] px-4 py-5 text-left transition-colors duration-300 last:border-r-0 ${
                isSelected ? "bg-ink text-white" : day.open ? "hover:bg-paper" : "cursor-not-allowed"
              }`}
            >
              <span
                className={`label ${isSelected ? "text-white/60" : day.open ? "text-ink/45" : "text-ink/25"}`}
              >
                {relative ?? weekdayShortL(day.date, locale)}
              </span>
              <span
                className={`mono-num text-3xl font-bold tracking-[-0.04em] ${
                  isSelected ? "text-white" : day.open ? "text-ink" : "text-ink/25"
                }`}
              >
                {dayNumber(day.date)}
              </span>
              <span
                className={`label ${isSelected ? "text-white/60" : day.open ? "text-ink/40" : "text-ink/20"}`}
              >
                {monthShortL(day.date, locale)}
              </span>
              <span
                aria-hidden="true"
                className={`mt-2 block h-[3px] w-6 ${
                  !day.open
                    ? "bg-ink/15"
                    : day.freeCount === 0
                      ? "bg-ink/20"
                      : isSelected
                        ? "bg-white"
                        : "bg-forest"
                }`}
              />
            </button>
          );
        })}
      </div>
      <p className="label mt-3 text-ink/35">
        <span className="mr-3 inline-block h-[3px] w-4 bg-forest align-middle" />{" "}
        {t("booking.time.available")}
        <span className="mx-3 inline-block h-[3px] w-4 bg-ink/20 align-middle" />{" "}
        {t("booking.time.limited")}
      </p>
    </div>
  );
}
