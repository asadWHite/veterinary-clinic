"use client";

import { useState } from "react";
import { useBooking } from "@/components/booking/BookingContext";
import { StageFrame } from "@/components/booking/StageFrame";
import { AnswerOption } from "@/components/booking/AnswerOption";
import { ageOptions } from "@/data/booking-options";
import { useI18n } from "@/i18n/I18nProvider";
import { pickL } from "@/i18n/localized";

function stageFromYears(years: number): string {
  if (years < 1) return "baby";
  if (years < 3) return "young";
  if (years < 8) return "adult";
  return "senior";
}

export function AgeSelector() {
  const { state, setAnswer, next, back , t, locale } = useBooking();
  const selected = typeof state.answers.age === "string" ? state.answers.age : null;
  const [manual, setManual] = useState("");
  const years = Number.parseInt(manual, 10);
  const derived = Number.isFinite(years) && years >= 0 ? stageFromYears(years) : null;

  return (
    <StageFrame
      eyebrow={t("booking.age.eyebrow")}
      title={t("booking.age.title1") + "\n" + t("booking.age.title2")}
      prompt={t("booking.age.prompt")}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ageOptions.map((option, i) => (
          <AnswerOption
            key={option.value}
            name="age"
            index={i}
            label={pickL(option.label, locale)}
            hint={option.hint ? pickL(option.hint, locale) : undefined}
            selected={selected === option.value}
            onSelect={() => setAnswer("age", option.value)}
          />
        ))}
      </div>

      <div className="mt-8 border-t border-[var(--line)] pt-8">
        <label htmlFor="exact-age" className="label text-ink/45">
          {t("booking.age.orExact")}
        </label>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <div className="flex items-end gap-3">
            <input
              id="exact-age"
              type="number"
              min={0}
              max={40}
              inputMode="numeric"
              value={manual}
              onChange={(e) => {
                setManual(e.target.value);
                const parsed = Number.parseInt(e.target.value, 10);
                if (Number.isFinite(parsed) && parsed >= 0) {
                  setAnswer("age", stageFromYears(parsed));
                  setAnswer("ageYears", String(parsed));
                }
              }}
              placeholder="3"
              className="mono-num w-24 border-b border-ink/40 bg-transparent pb-2 text-3xl font-bold tracking-tight outline-none focus:border-ink"
            />
            <span className="label pb-3 text-ink/45">{t("booking.age.years")}</span>
          </div>
          {derived ? (
            <p className="label text-forest">
              {t("booking.age.understood", { stage: pickL(ageOptions.find((o) => o.value === derived)?.label, locale) })}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={back}
          className="label px-2 py-4 text-ink/50 hover:text-ink"
        >
          {t("common.back")}
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={next}
          className="label arrow-forward flex items-center gap-3 bg-ink px-8 py-5 text-white transition-colors hover:bg-forest disabled:cursor-not-allowed disabled:opacity-30"
        >
          {t("common.continue")}
          <span className="arrow">→</span>
        </button>
      </div>
    </StageFrame>
  );
}
