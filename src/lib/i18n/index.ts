import uz from "@/locales/uz.json";
import ru from "@/locales/ru.json";
import en from "@/locales/en.json";
import { DEFAULT_LOCALE, type Locale, normalizeLocale } from "@/lib/i18n/config";

export type Dictionary = typeof uz;

export const DICTIONARIES: Record<Locale, Dictionary> = {
  uz,
  ru: ru as unknown as Dictionary,
  en: en as unknown as Dictionary,
};

type Path = string;

function walk(dict: unknown, path: Path): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
}

export type Translator = {
  locale: Locale;
  t: (path: Path) => string;
  tList: (path: Path) => string[];
  tObj: (path: Path) => Record<string, string>;
  tRaw: (path: Path) => unknown;
};

export function createTranslator(locale: Locale, dict: Dictionary = DICTIONARIES[locale]): Translator {
  return {
    locale,
    t: (path) => {
      const value = walk(dict, path);
      return typeof value === "string" ? value : path;
    },
    tList: (path) => {
      const value = walk(dict, path);
      // Only strings are returned: arrays of objects (e.g. rich content blocks)
      // must be read with t(`path.index.key`) so they can never be rendered
      // directly as React children.
      return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];
    },
    tObj: (path) => {
      const value = walk(dict, path);
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, string>;
      }
      return {};
    },
    tRaw: (path) => walk(dict, path),
  };
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[normalizeLocale(locale)] ?? DICTIONARIES[DEFAULT_LOCALE];
}
