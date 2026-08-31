import uz from "@/locales/uz.json";
import ru from "@/locales/ru.json";
import en from "@/locales/en.json";
import { defaultLocale, type Locale } from "@/i18n/config";

export type Dictionary = typeof en;

export const dictionaries: Record<Locale, Dictionary> = {
  uz: uz as unknown as Dictionary,
  ru: ru as unknown as Dictionary,
  en,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

type Vars = Record<string, string | number>;

function resolve(dict: unknown, key: string): unknown {
  if (dict === null || dict === undefined) return undefined;
  const parts = key.split(".");
  let node: unknown = dict;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return node;
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`,
  );
}

/**
 * Translate a structured key ("booking.steps.companion") with optional
 * interpolation. Falls back to English, then to the key itself.
 */
export function translate(locale: Locale, key: string, vars?: Vars): string {
  const raw = resolve(dictionaries[locale], key) ?? resolve(dictionaries.en, key);
  if (typeof raw !== "string") return key;
  return interpolate(raw, vars);
}

export function createTranslator(locale: Locale) {
  return (key: string, vars?: Vars) => translate(locale, key, vars);
}

export type Translator = ReturnType<typeof createTranslator>;

/** Pick a localized value from a `{ uz, ru, en }` object. */
export function pick<T>(value: Partial<Record<Locale, T>> | undefined, locale: Locale): T {
  if (!value) return undefined as unknown as T;
  return (value[locale] ?? value.en) as T;
}
