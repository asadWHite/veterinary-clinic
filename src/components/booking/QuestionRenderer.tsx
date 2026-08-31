"use client";

import { useState } from "react";
import { useBooking } from "@/components/booking/BookingContext";
import { AnswerOption } from "@/components/booking/AnswerOption";
import type { QuestionDef } from "@/data/questions";
import { answerList } from "@/data/questions";
import { useI18n } from "@/i18n/I18nProvider";
import { pickL } from "@/i18n/localized";

type QuestionRendererProps = {
  question: QuestionDef;
  value: string | string[] | undefined;
  onBack: () => void;
  backLabel: string;
  /** Marks a multi-select question as finished so the engine can move on. */
  onConfirm: () => void;
};

export function QuestionRenderer({
  question,
  value,
  onBack,
  backLabel,
  onConfirm,
}: QuestionRendererProps) {
  const { setAnswer , t, locale } = useBooking();
  const [text, setText] = useState(typeof value === "string" ? value : "");
  /** Shows the choice for a moment before moving on, so the flow reads calmly. */
  const [chosen, setChosen] = useState<string | null>(null);
  const isMulti = question.type === "multi";
  const selectedList = answerList(value);

  const toggleMulti = (optionValue: string) => {
    const nextList = selectedList.includes(optionValue)
      ? selectedList.filter((v) => v !== optionValue)
      : [...selectedList, optionValue];
    setAnswer(question.id, nextList);
  };

  const advance = () => {
    onConfirm();
    if (question.type !== "multi") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const title = pickL(question.title, locale);
  const lines = title.split("\n");

  return (
    <div>
      <h2 className="display d3 uppercase">
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
      {question.prompt ? (
        <p className="body-lg mt-4 max-w-xl">{pickL(question.prompt, locale)}</p>
      ) : null}

      <div className="mt-8">
        {question.type === "text" ? (
          <div>
            <label htmlFor={question.id} className="sr-only">
              {title}
            </label>
            <textarea
              id={question.id}
              value={text}
              rows={5}
              placeholder={pickL(question.placeholder, locale)}
              onChange={(e) => setText(e.target.value)}
              className="w-full resize-none border border-[var(--line)] bg-canvas p-5 text-[0.95rem] leading-relaxed outline-none transition-colors focus:border-ink"
            />
          </div>
        ) : (
          <div
            role={isMulti ? "group" : "radiogroup"}
            aria-label={title}
            className={`grid grid-cols-1 gap-3 ${isMulti ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}
          >
            {question.options?.map((option, i) => (
              <AnswerOption
                key={option.value}
                name={question.id}
                index={i}
                multi={isMulti}
                label={pickL(option.label, locale)}
                hint={option.hint ? pickL(option.hint, locale) : undefined}
                tone={option.tone}
                selected={
                  isMulti
                    ? selectedList.includes(option.value)
                    : value === option.value || chosen === option.value
                }
                onSelect={() => {
                  if (isMulti) {
                    toggleMulti(option.value);
                  } else if (value !== option.value) {
                    setChosen(option.value);
                    window.setTimeout(() => {
                      setAnswer(question.id, option.value);
                      setChosen(null);
                    }, 300);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button type="button" onClick={onBack} className="label px-2 py-4 text-ink/50 hover:text-ink">
          {backLabel}
        </button>

        {isMulti ? (
          <button
            type="button"
            disabled={selectedList.length === 0}
            onClick={advance}
            className="label arrow-forward flex items-center gap-3 bg-ink px-8 py-5 text-white transition-colors hover:bg-forest disabled:cursor-not-allowed disabled:opacity-30"
          >
            Continue
            <span className="arrow">→</span>
          </button>
        ) : null}

        {question.type === "text" ? (
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                if (text.trim()) setAnswer(question.id, text.trim());
                else setAnswer(question.id, "");
                advance();
              }}
              className="label arrow-forward flex items-center gap-3 bg-ink px-8 py-5 text-white transition-colors hover:bg-forest"
            >
              {t("common.continue")}
              <span className="arrow">→</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAnswer(question.id, "");
                advance();
              }}
              className="label px-2 py-4 text-ink/50 hover:text-ink"
            >
              {t("common.skip")}
            </button>
          </div>
        ) : null}

        {!isMulti && question.type !== "text" ? (
          <p className="label text-ink/35">{t("booking.selectOneToContinue")}</p>
        ) : null}
      </div>
    </div>
  );
}
