"use client";

import { useI18n } from "@/lib/i18n/client";

/** Question and answer labels resolve in the UI — stored values stay language-neutral. */
export function useBookingLabels() {
  const { t } = useI18n();

  function questionLabel(key: string): string {
    if (key === "species") return "species";
    if (key === "life_stage") return "life stage";
    if (key === "reason") return "reason";
    const label = t(`questions.${key}`);
    return label.startsWith("questions.") ? key : label;
  }

  function answerLabel(key: string, value: string): string {
    return value
      .split(",")
      .filter(Boolean)
      .map((part) => {
        const label = t(`answers.${key}.${part}`);
        return label.startsWith("answers.") ? part : label;
      })
      .join(", ");
  }

  function questionValue(key: string, value: string): string {
    if (key === "main_concern") {
      const label = t(`concerns.${value}`);
      return label.startsWith("concerns.") ? value : label;
    }
    return answerLabel(key, value);
  }

  return { questionLabel, answerLabel, questionValue };
}
