"use client";

import { useEffect, useMemo, useState } from "react";
import { useBooking } from "@/components/booking/BookingContext";
import { QuestionRenderer } from "@/components/booking/QuestionRenderer";
import type { QuestionDef } from "@/data/questions";
import { pickL } from "@/i18n/localized";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * The engine never renders a fixed list. It always shows the first question
 * that is still relevant and unanswered, so branching is a consequence of the
 * answers rather than a hardcoded path.
 */
export function QuestionnaireEngine() {
  const { state, questions, go, setAnswer , t, locale } = useBooking();
  const [confirmed, setConfirmed] = useState<string[]>([]);

  const isAnswered = (q: QuestionDef) => {
    const value = state.answers[q.id];
    if (q.type === "multi") return Array.isArray(value) && value.length > 0;
    if (q.optional) return value !== undefined;
    return value !== undefined && value !== "";
  };

  const pending = useMemo(
    () =>
      questions.filter((q) => {
        if (q.type === "multi") {
          return !(isAnswered(q) && confirmed.includes(q.id));
        }
        return !isAnswered(q);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, state.answers, confirmed],
  );

  const answered = questions.filter(isAnswered);
  const current = pending[0] ?? null;

  useEffect(() => {
    if (state.stage === "context" && !current) go("care");
  }, [current, state.stage, go]);

  useEffect(() => {
    if (current) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [current?.id]);

  const handleBack = () => {
    const last = answered[answered.length - 1];
    if (!last) {
      go("concern");
      return;
    }
    setConfirmed((prev) => prev.filter((id) => id !== last.id));
    setAnswer(last.id, last.type === "multi" ? [] : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-6 border-b border-[var(--line)] pb-4">
        <div>
          <p className="label text-ink/40">{t("booking.questionnaire.eyebrow")}</p>
          <p className="label mono-num mt-2 text-ink/35">
            {t("booking.questionOf", { current: Math.min(answered.length + 1, questions.length), total: questions.length })}
          </p>
        </div>
        <div className="flex flex-1 items-center gap-1 sm:max-w-[240px] sm:justify-end">
          {questions.map((q) => {
            const done = answered.includes(q);
            return (
              <span
                key={q.id}
                title={pickL(q.title, locale)}
                className={`h-[3px] flex-1 transition-colors duration-500 ${
                  done ? "bg-forest" : "bg-ink/12"
                }`}
              />
            );
          })}
        </div>
      </div>

      {current ? (
        <div key={current.id} className="hero-rise pt-10">
          <QuestionRenderer
            question={current}
            value={state.answers[current.id]}
            onBack={handleBack}
            backLabel={
              answered.length > 0
                ? t("booking.questionnaire.backAnswer")
                : t("booking.questionnaire.backConcern")
            }
            onConfirm={() => setConfirmed((prev) => [...prev, current.id])}
          />
        </div>
      ) : null}
    </div>
  );
}
