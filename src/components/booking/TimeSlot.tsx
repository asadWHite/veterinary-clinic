"use client";

import type { SlotDto } from "@/types/booking";
import { useI18n } from "@/i18n/I18nProvider";

function stateLabel(state: SlotDto["state"], t: (k: string) => string) {
  switch (state) {
    case "booked":
      return t("booking.time.booked");
    case "past":
      return t("booking.time.past");
    case "blocked":
      return t("booking.time.unavailable");
    default:
      return "";
  }
}

export function TimeSlot({
  slot,
  selected,
  onSelect,
}: {
  slot: SlotDto;
  selected: boolean;
  onSelect: (time: string) => void;
}) {
  const { t } = useI18n();
  const disabled = slot.state !== "free";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => onSelect(slot.time)}
      data-state={selected ? "selected" : slot.state}
      className="slot w-full flex-col"
      tabIndex={disabled ? -1 : 0}
    >
      <span className="slot-time text-base font-bold tracking-[-0.02em]">{slot.time}</span>
      <span className="label mt-1 text-[0.5rem] tracking-[0.22em]">
        {selected ? t("common.selected") : stateLabel(slot.state, t)}
      </span>
    </button>
  );
}
