import { localeTags, type Locale } from "@/lib/i18n/config";

export const CLINIC_TIMEZONE_FALLBACK = "Asia/Tashkent";
/** Minimum notice before an appointment can start today. */
export const BOOKING_LEAD_MINUTES = 60;
/** Grid step for generated slots. */
export const SLOT_STEP_MINUTES = 15;
/** How many days ahead a client can book. */
export const BOOKING_HORIZON_DAYS = 30;

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMinutes(value: string): number {
  const [h, m] = value.split(":").map((part) => Number.parseInt(part, 10));
  return (h || 0) * 60 + (m || 0);
}

/** Current date/time in a specific IANA zone, without external dependencies. */
export function nowInZone(timeZone: string = CLINIC_TIMEZONE_FALLBACK): {
  day: string;
  minute: number;
  weekday: number;
} {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = formatter.formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const day = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = Number.parseInt(get("hour"), 10) % 24;
  const minute = Number.parseInt(get("minute"), 10);
  const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekdayIndex = weekdayNames.indexOf(get("weekday").slice(0, 3));
  return { day, minute: hour * 60 + minute, weekday: weekdayIndex < 0 ? 0 : weekdayIndex };
}

export function parseDay(day: string): Date {
  const [y, m, d] = day.split("-").map((part) => Number.parseInt(part, 10));
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

export function toDayString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(day: string, amount: number): string {
  const date = parseDay(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return toDayString(date);
}

/** 0 = Monday … 6 = Sunday */
export function weekdayOf(day: string): number {
  const iso = parseDay(day).getUTCDay(); // 0 = Sunday
  return (iso + 6) % 7;
}

export function formatDateLong(day: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTags[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(parseDay(day));
}

export function formatDateMedium(day: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTags[locale], {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(parseDay(day));
}

export function formatDateShort(day: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTags[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseDay(day));
}

export function formatWeekdayShort(day: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTags[locale], {
    weekday: "short",
    timeZone: "UTC",
  }).format(parseDay(day));
}

export function formatDateTime(value: Date | string, locale: Locale): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(localeTags[locale], {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatRelativeDay(day: string, locale: Locale, t: (key: string) => string): string {
  const today = nowInZone().day;
  if (day === today) return t("common.today");
  if (day === addDays(today, 1)) return t("common.tomorrow");
  return formatDateLong(day, locale);
}

export function ageFromBirthDate(
  birthDate: string | null | undefined,
  locale: Locale,
): string | null {
  if (!birthDate) return null;
  const birth = parseDay(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let months =
    (now.getUTCFullYear() - birth.getUTCFullYear()) * 12 + (now.getUTCMonth() - birth.getUTCMonth());
  if (now.getUTCDate() < birth.getUTCDate()) months -= 1;
  if (months < 0) months = 0;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const rtf = new Intl.RelativeTimeFormat(localeTags[locale], { numeric: "auto" });
  const yearPart = years > 0 ? new Intl.NumberFormat(localeTags[locale]).format(years) : "";
  const monthPart = rest > 0 ? rtf.format(rest, "month").replace(/^[^\d]*/, "") : "";
  if (years > 0 && rest > 0) return `${yearPart} · ${monthPart}`;
  if (years > 0) return yearPart;
  if (rest > 0) return monthPart;
  return rtf.format(0, "month").replace(/^[^\d]*/, "");
}

export function lifeStageFromBirthDate(birthDate: string | null | undefined): "baby" | "young" | "adult" | "senior" {
  if (!birthDate) return "adult";
  const months = monthDiff(birthDate);
  if (months <= 6) return "baby";
  if (months <= 24) return "young";
  if (months <= 84) return "adult";
  return "senior";
}

function monthDiff(birthDate: string): number {
  const birth = parseDay(birthDate);
  const now = new Date();
  let months =
    (now.getUTCFullYear() - birth.getUTCFullYear()) * 12 + (now.getUTCMonth() - birth.getUTCMonth());
  if (now.getUTCDate() < birth.getUTCDate()) months -= 1;
  return Math.max(0, months);
}

export function bookingDayRange(fromDay: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => addDays(fromDay, index));
}

export function icsTimestamp(day: string, minute: number): string {
  const date = parseDay(day);
  const h = String(Math.floor(minute / 60)).padStart(2, "0");
  const m = String(minute % 60).padStart(2, "0");
  return `${date.toISOString().slice(0, 10).replace(/-/g, "")}T${h}${m}00`;
}
