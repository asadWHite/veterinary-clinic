import type { Locale } from "@/i18n/config";

export type Localized<T> = { uz: T; ru: T; en: T };

/** Read the locale's value, falling back to English. */
export function pickL<T>(value: Localized<T> | undefined | null, locale: Locale): T {
  return (value?.[locale] ?? value?.en) as T;
}
