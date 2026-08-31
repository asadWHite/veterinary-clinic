"use client";

import { useBooking } from "@/components/booking/BookingContext";
import { StageFrame } from "@/components/booking/StageFrame";
import { AnswerOption } from "@/components/booking/AnswerOption";
import { concernOptions } from "@/data/booking-options";
import { useI18n } from "@/i18n/I18nProvider";
import { pickL } from "@/i18n/localized";

export function ConcernSelector() {
  const { state, setAnswer, next, back , t, locale } = useBooking();
  const selected = typeof state.answers.concern === "string" ? state.answers.concern : null;

  return (
    <StageFrame
      eyebrow={t("booking.concern.eyebrow")}
      title={t("booking.concern.title1") + "\n" + t("booking.concern.title2") + "\n" + t("booking.concern.title3")}
      prompt={t("booking.concern.prompt")}
    >
      <div
        role="radiogroup"
        aria-label="Reason for visit"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {concernOptions.map((option, i) => (
          <AnswerOption
            key={option.value}
            name="concern"
            index={i}
            label={pickL(option.label, locale)}
            hint={option.hint ? pickL(option.hint, locale) : undefined}
            selected={selected === option.value}
            onSelect={() => {
              setAnswer("concern", option.value);
            }}
          />
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button type="button" onClick={back} className="label px-2 py-4 text-ink/50 hover:text-ink">
          {t("common.back")}
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={next}
          className="label arrow-forward flex items-center gap-3 bg-ink px-8 py-5 text-white transition-colors hover:bg-forest disabled:cursor-not-allowed disabled:opacity-30"
        >
          {selected === "check-up" || selected === "vaccination"
            ? t("booking.concern.continueQuiet")
            : t("booking.concern.continueMore")}
          <span className="arrow">→</span>
        </button>
      </div>
    </StageFrame>
  );
}
