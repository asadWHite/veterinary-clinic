"use client";

import type { DayAvailabilityDto, SlotDto } from "@/types/booking";
import { TimeSlot } from "@/components/booking/TimeSlot";
import { useI18n } from "@/i18n/I18nProvider";

const PARTS: { id: SlotDto["part"]; key: string }[] = [
  { id: "morning", key: "booking.time.morning" },
  { id: "afternoon", key: "booking.time.afternoon" },
  { id: "evening", key: "booking.time.evening" },
];

export function AvailabilityGrid({
  day,
  selected,
  onSelect,
}: {
  day: DayAvailabilityDto;
  selected: string | null;
  onSelect: (time: string) => void;
}) {
  const { t } = useI18n();
  if (!day.open) {
    return (
      <div className="border border-[var(--line)] p-10 text-center">
        <p className="display d5 uppercase">{t("booking.time.closed")}</p>
        <p className="label mt-3 text-ink/40">{t("booking.time.closedBody")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {PARTS.map((part) => {
        const slots = day.slots.filter((s) => s.part === part.id);
        if (slots.length === 0) return null;
        const anyAvailable = slots.some((s) => s.state === "free");
        return (
          <div key={part.id}>
            <div className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-2">
              <p className="label">{t(part.key)}</p>
              <p className="label text-ink/35">
                {anyAvailable ? t("booking.time." + part.id) : t("booking.time.fullyBooked")}
              </p>
            </div>
            <div
              role="radiogroup"
              aria-label={t(part.key)}
              className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5"
            >
              {slots.map((slot) => (
                <TimeSlot
                  key={slot.time}
                  slot={slot}
                  selected={selected === slot.time}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--line)] pt-4">
        <span className="label text-ink/40">
          <span className="mr-2 inline-block h-2 w-2 border border-ink/40 align-middle" />{" "}
          {t("booking.time.legendAvailable")}
        </span>
        <span className="label text-ink/40">
          <span className="strike mr-2 inline-block align-middle">14:30</span>{" "}
          {t("booking.time.legendBooked")}
        </span>
        <span className="label text-ink/40">{t("booking.time.legendPast")}</span>
        <span className="label text-ink/40">{t("booking.time.legendBlocked")}</span>
      </div>
    </div>
  );
}
