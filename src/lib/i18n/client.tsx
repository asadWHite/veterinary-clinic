"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTranslator, type Dictionary, type Translator } from "@/lib/i18n/index";
import type { Locale } from "@/lib/i18n/config";

type I18nValue = Translator & {
  locale: Locale;
  locales: Locale[];
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo<I18nValue>(() => {
    const translator = createTranslator(locale, dictionary);
    return { ...translator, locale, locales: ["uz", "ru", "en"] };
  }, [locale, dictionary]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return ctx;
}
