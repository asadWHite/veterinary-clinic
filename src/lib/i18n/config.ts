export const LOCALES = ["uz", "ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "uz";
export const LOCALE_COOKIE = "vc_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  uz: "UZ",
  ru: "RU",
  en: "EN",
};

export const LOCALE_LANGUAGE_NAMES: Record<Locale, string> = {
  uz: "O‘zbekcha",
  ru: "Русский",
  en: "English",
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return isLocale(value ?? undefined) ? (value as Locale) : DEFAULT_LOCALE;
}

/** Locale-aware formatting that works on server and client without extra deps. */
export const localeTags: Record<Locale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-GB",
};

export function pickLocalized(
  value: { uz: string; ru: string; en: string } | null | undefined,
  locale: Locale,
): string {
  if (!value) return "";
  return value[locale] || value.en || value.uz || value.ru || "";
}
