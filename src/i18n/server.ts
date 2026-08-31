import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale, type Locale } from "@/i18n/config";
import { createTranslator, getDictionary, type Dictionary, type Translator } from "@/i18n/dictionaries";

export type ServerI18n = {
  locale: Locale;
  t: Translator;
  dict: Dictionary;
};

/** Locale for the current request, from the persisted cookie. */
export async function getI18n(): Promise<ServerI18n> {
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  return { locale, t: createTranslator(locale), dict: getDictionary(locale) };
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}
