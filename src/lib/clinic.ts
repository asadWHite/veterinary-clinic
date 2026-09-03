import content from "@/clinic-content.json";

export type Localized = { uz: string; ru: string; en: string };
export type Locale = "uz" | "ru" | "en";

export type ClinicBrand = {
  name: string;
  fullName: Localized;
  shortLabel: Localized;
  website: string;
  instagramHandle: string;
  instagramUrl: string;
  phones: string[];
  phoneLinks: string[];
  email: string;
  address: Localized;
  addressShort: Localized;
  hours: Localized;
  hoursWeekdays: Localized;
  hoursWeekend: Localized;
  lastAppointment: string;
  timezone: string;
};

export const CLINIC: ClinicBrand = content.brand;

export const CLINIC_SERVICES = content.services;
export const CLINIC_DOCTORS = content.doctors;
export const CLINIC_JOURNAL = content.journal;
export const CLINIC_SCHEDULE = content.schedule;

export const LAST_APPOINTMENT_MINUTE: number = content.schedule.lastAppointmentMinute;

/** 0 = Monday … 6 = Sunday */
export function clinicIntervalsForWeekday(weekday: number): Array<{ start: number; end: number }> {
  const isWeekend = weekday === 5 || weekday === 6;
  const raw = isWeekend ? CLINIC_SCHEDULE.weekend : CLINIC_SCHEDULE.weekdays;
  return raw.map((interval) => ({
    start: Number(interval.start.slice(0, 2)) * 60 + Number(interval.start.slice(3, 5)),
    end: Number(interval.end.slice(0, 2)) * 60 + Number(interval.end.slice(3, 5)),
  }));
}

export function clinicWeekdaysForPattern(pattern: string): number[] {
  if (pattern === "weekdays") return [0, 1, 2, 3, 4];
  if (pattern === "weekdaysPlusSaturday") return [0, 1, 2, 3, 4, 5];
  return [0, 1, 2, 3, 4, 5, 6];
}

export function pick(value: Localized | null | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] || value.en || value.uz || value.ru || "";
}

export function clinicNameFor(locale: Locale): string {
  return pick(CLINIC.fullName, locale);
}

export function clinicAddressFor(locale: Locale): string {
  return pick(CLINIC.address, locale);
}

export function clinicHoursFor(locale: Locale): string {
  return pick(CLINIC.hours, locale);
}

/* ------------------------------------------------------------ offline cards */

export type OfflineService = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  durationMinutes: number;
  sortOrder: number;
};

export function offlineServices(locale: Locale): OfflineService[] {
  return CLINIC_SERVICES.map((service, index) => ({
    id: index + 1,
    slug: service.slug,
    title: pick(service.title, locale),
    summary: pick(service.summary, locale),
    description: pick(service.description, locale),
    durationMinutes: service.duration,
    sortOrder: service.order,
  }));
}

export type OfflineDoctor = {
  id: number;
  slug: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string | null;
  experienceYears: number | null;
  languages: string[];
  isPlaceholder: boolean;
  serviceSlugs: string[];
  reviewCount: number;
  averageRating: number | null;
  weekdayBits: number;
};

export function offlineDoctors(locale: Locale): OfflineDoctor[] {
  return CLINIC_DOCTORS.map((doctor, index) => ({
    id: index + 1,
    slug: doctor.slug,
    name: pick(doctor.name, locale),
    title: pick(doctor.title, locale),
    bio: pick(doctor.bio, locale),
    photoUrl: null,
    experienceYears: null,
    languages: doctor.languages,
    isPlaceholder: true,
    serviceSlugs: doctor.services,
    reviewCount: 0,
    averageRating: null,
    weekdayBits: clinicWeekdaysForPattern(doctor.schedulePattern).reduce(
      (bits, weekday) => bits | (1 << weekday),
      0,
    ),
  }));
}

export type OfflineJournal = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  categoryKey: string;
  coverUrl: string | null;
  readingMinutes: number | null;
  publishedAt: Date;
};

export function offlineJournal(locale: Locale): OfflineJournal[] {
  return CLINIC_JOURNAL.map((post, index) => {
    const published = new Date();
    published.setUTCDate(published.getUTCDate() + post.publishedOffsetDays);
    return {
      id: index + 1,
      slug: post.slug,
      title: pick(post.title, locale),
      excerpt: pick(post.excerpt, locale),
      body: pick(post.body, locale),
      categoryKey: post.category,
      coverUrl: post.cover,
      readingMinutes: post.minutes,
      publishedAt: published,
    };
  }).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

/* ---------------------------------------------------------- database status */

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}
