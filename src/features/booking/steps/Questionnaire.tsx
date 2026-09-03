"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import {
  QUESTIONS,
  nextQuestionKey,
  pruneAnswers,
  questionSequence,
} from "@/lib/booking/questions";
import type { StepApi } from "@/features/booking/steps/OpeningSteps";
import { useBookingLabels } from "@/features/booking/labels";

export function Questionnaire({ state, set, go }: StepApi) {
  const { t } = useI18n();
  const { questionLabel, answerLabel } = useBookingLabels();
  const [pending, setPending] = useState<string | null>(null);

  const reason = state.reason ?? "other";
  const currentKey = nextQuestionKey(reason, state.answers);
  const question = currentKey ? QUESTIONS[currentKey] : null;
  const sequence = questionSequence(reason, state.answers);
  const answeredCount = sequence.filter((key) => state.answers[key] !== undefined).length;
  const position = Math.min(answeredCount + 1, Math.max(sequence.length, 1));

  function commit(key: string, value: string) {
    const nextAnswers = { ...state.answers, [key]: value };
    // Changing a branching answer only invalidates that branch.
    const pruned = pruneAnswers(reason, nextAnswers);
    const path = questionSequence(reason, pruned);
    set({
      answers: pruned,
      questionPath: path,
      recommendedServiceSlug: null,
    });
    setPending(key);
    window.setTimeout(() => {
      setPending(null);
      if (nextQuestionKey(reason, pruned) === null) {
        go("recommendation");
      }
    }, 260);
  }

  function back() {
    const path = [...state.questionPath];
    const lastKey = path.filter((key) => state.answers[key] !== undefined).pop();
    if (!lastKey) {
      go("reason");
      return;
    }
    const nextAnswers = { ...state.answers };
    delete nextAnswers[lastKey];
    set({
      answers: nextAnswers,
      questionPath: path.filter((key) => key !== lastKey),
      recommendedServiceSlug: null,
    });
  }

  if (!question || !currentKey) {
    return (
      <div className="step-enter flex flex-col items-start gap-6">
        <p className="text-lg text-ink">{t("booking.recommendation.title")}</p>
        <button type="button" onClick={() => go("recommendation")} className="btn btn-primary">
          {t("booking.questions.continue")}
        </button>
      </div>
    );
  }

  const multi = question.type === "multi";
  const selected = multi ? (state.answers[currentKey] ?? "").split(",").filter(Boolean) : [];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-4">
        <span className="section-index">
          {position} / {Math.max(sequence.length, 1)}
        </span>
        <span className="h-px flex-1 bg-line" />
        <span className="label-eyebrow">{t("booking.questions.lead")}</span>
      </div>

      <div key={currentKey} className="step-enter flex flex-col gap-8">
        <h3 className="max-w-3xl text-h2 font-normal tracking-tight text-ink">
          {questionLabel(currentKey)}
        </h3>

        {question.type === "text" ? (
          <div className="flex flex-col gap-5">
            <textarea
              autoFocus
              rows={4}
              className="field-input resize-none text-lg"
              placeholder={t("booking.questions.notePlaceholder")}
              defaultValue={state.answers[currentKey] ?? ""}
              onBlur={(event) => set({ answers: { ...state.answers, [currentKey]: event.target.value } })}
            />
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => commit(currentKey, state.answers[currentKey] ?? "")}
                className="btn btn-primary"
              >
                {t("booking.questions.continue")}
              </button>
              {question.optional && (
                <button
                  type="button"
                  onClick={() => commit(currentKey, "")}
                  className="btn btn-quiet"
                >
                  {t("booking.questions.skip")}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {multi && (
              <p className="mb-2 text-xs text-ink-2">{t("booking.questions.multiHint")}</p>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(question.options ?? []).map((option) => {
                const isMultiSelected = multi && selected.includes(option.value);
                const isSingleSelected = pending === currentKey && !multi
                  ? state.answers[currentKey] === option.value
                  : state.answers[currentKey] === option.value;
                const active = multi ? isMultiSelected : isSingleSelected;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (multi) {
                        const next = isMultiSelected
                          ? selected.filter((value) => value !== option.value)
                          : [...selected, option.value];
                        set({
                          answers: { ...state.answers, [currentKey]: next.join(",") },
                        });
                        return;
                      }
                      commit(currentKey, option.value);
                    }}
                    aria-pressed={active}
                    className={cn(
                      "flex items-center justify-between gap-3 border px-5 py-4 text-left transition-colors",
                      active ? "border-forest bg-canvas-2/70" : "border-line hover:border-ink/40",
                    )}
                  >
                    <span className="text-base tracking-tight text-ink">
                      {answerLabel(currentKey, option.value)}
                    </span>
                    {option.urgency === "urgent" && (
                      <span aria-hidden className="text-xs text-clay">
                        ▲
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {multi && (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => commit(currentKey, (state.answers[currentKey] ?? "").trim())}
                  className="btn btn-primary"
                >
                  {t("booking.questions.continue")}
                </button>
                <button
                  type="button"
                  onClick={() => commit(currentKey, "")}
                  className="btn btn-quiet"
                >
                  {t("booking.questions.skip")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-6">
        <button type="button" onClick={back} className="link-underline text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase">
          ← {t("booking.questions.back")}
        </button>
        {state.questionPath.length > 0 && (
          <span className="text-xs text-ink-2">
            {state.questionPath
              .filter((key) => state.answers[key])
              .map((key) => answerLabel(key, state.answers[key]))
              .join(" · ")}
          </span>
        )}
      </div>
    </div>
  );
}
