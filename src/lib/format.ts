import type { Locale } from "@/i18n/config";
import { intlLocale } from "@/i18n/config";
import { translate } from "@/i18n/dictionaries";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function format(iso: string, locale: Locale, options: Intl.DateTimeFormatOptions): string {
  const date = parseISO(iso);
  try {
    return new Intl.DateTimeFormat(intlLocale[locale], options).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }
}

/* ---------- locale-aware formatting ---------- */

export function weekdayNameL(iso: string, locale: Locale): string {
  return format(iso, locale, { weekday: "long" });
}

export function weekdayShortL(iso: string, locale: Locale): string {
  return format(iso, locale, { weekday: "short" });
}

export function monthShortL(iso: string, locale: Locale): string {
  return format(iso, locale, { month: "short" });
}

export function dayNumber(iso: string): string {
  return format(iso, "en", { day: "2-digit" });
}

export function monthDayL(iso: string, locale: Locale): string {
  return format(iso, locale, { day: "numeric", month: "long" });
}

/** EN: "Monday, September 1" · RU: "понедельник, 1 сентября" · UZ: "dushanba, 1-sentabr" */
export function longDateL(iso: string, locale: Locale): string {
  return format(iso, locale, { weekday: "long", day: "numeric", month: "long" });
}

export function shortDateL(iso: string, locale: Locale): string {
  return format(iso, locale, { day: "2-digit", month: "short" });
}

export function relativeDayL(iso: string, locale: Locale): string | null {
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
  if (iso === todayISO) return translate(locale, "time.today");
  const diff = Math.round((parseISO(iso).getTime() - parseISO(todayISO).getTime()) / 86400000);
  if (diff === 1) return translate(locale, "time.tomorrow");
  if (diff === -1) return translate(locale, "time.yesterday");
  return null;
}

export function durationLabelL(minutes: number, locale: Locale): string {
  if (minutes < 60) return `${minutes} ${translate(locale, "common.minutes")}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hours = `${h} ${translate(locale, "common.hours")}`;
  return m === 0 ? hours : `${hours} ${m} ${translate(locale, "common.minutes")}`;
}

/* ---------- English fallbacks (used where a locale is not yet threaded) ---------- */

export function weekdayName(iso: string): string {
  return WEEKDAYS[parseISO(iso).getDay()] ?? "";
}

export function weekdayShort(iso: string): string {
  return (WEEKDAYS[parseISO(iso).getDay()] ?? "").slice(0, 3).toUpperCase();
}

export function monthShort(iso: string): string {
  return (MONTHS[parseISO(iso).getMonth()] ?? "").slice(0, 3).toUpperCase();
}

export function monthDay(iso: string): string {
  const d = parseISO(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function longDate(iso: string): string {
  const d = parseISO(iso);
  return `${WEEKDAYS[d.getDay()]} · ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function shortDate(iso: string): string {
  const d = parseISO(iso);
  return `${MONTHS[d.getMonth()].slice(0, 3).toUpperCase()} ${String(d.getDate()).padStart(2, "0")}`;
}

export function durationLabel(minutes: number): string {
  return durationLabelL(minutes, "en");
}

export function relativeDay(iso: string): string | null {
  return relativeDayL(iso, "en");
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ageLabel(years: number | null | undefined): string {
  if (years === null || years === undefined) return "—";
  if (years < 1) return "Under a year";
  return `${years} ${years === 1 ? "year" : "years"}`;
}

export function ageLabelL(years: number | null | undefined, locale: Locale): string {
  if (years === null || years === undefined) return translate(locale, "notAvailable");
  const stage = years < 1 ? "baby" : years < 3 ? "young" : years < 8 ? "adult" : "senior";
  return `${years} — ${translate(locale, `ageStage.${stage}`)}`;
}
