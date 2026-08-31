import type { Localized } from "@/i18n/localized";
import type { Locale } from "@/i18n/config";
import { pickL } from "@/i18n/localized";
export type DoctorSeed = {
  slug: string;
  code: string;
  name: string;
  role: string;
  specialization: Localized<string>;
  summary: string;
  bio: string;
  photoKey: string | null;
  initials: string;
  speciesFocus: string[];
  languages: string[];
  sortOrder: number;
  /** Recurring weekday blocks, e.g. lunch and surgery time. */
  weekdayBlocks: { weekday: number; startTime: string; endTime: string; label: string; reason: string }[];
};

/**
 * Placeholder clinicians. Names, credentials, availability and portraits are
 * all placeholders — replace before launch.
 */
export const doctorSeeds: DoctorSeed[] = [
  {
    slug: "doctor-01",
    code: "01",
    name: "Dr. [DOCTOR NAME]",
    role: "General Practitioner",
    specialization: { uz: "Umumiy amaliyot va profilaktika", ru: "Общая практика и профилактика", en: "General Practice & Preventive Care" },
    summary: "First visits, preventive care and the long view of a companion's life.",
    bio: "[BIO PLACEHOLDER] Dr. [DOCTOR NAME] works with dogs, cats and small companions across general practice, with a focus on preventive planning and calm, unhurried consultations.",
    photoKey: "/images/doctors/veterinarian-01.jpg",
    initials: "01",
    speciesFocus: ["dog", "cat", "small", "bird", "other"],
    languages: ["English", "[LANGUAGE]"],
    sortOrder: 1,
    weekdayBlocks: [
      { weekday: 1, startTime: "12:30", endTime: "13:00", label: "Team break", reason: "break" },
      { weekday: 3, startTime: "15:00", endTime: "17:00", label: "Surgery block", reason: "surgery" },
    ],
  },
  {
    slug: "doctor-02",
    code: "02",
    name: "Dr. [DOCTOR NAME]",
    role: "Internal Medicine Clinician",
    specialization: { uz: "Ichki kasalliklar va tashxis", ru: "Внутренние болезни и диагностика", en: "Internal Medicine & Diagnostics" },
    summary: "Diagnostics, laboratory work and the cases that need time.",
    bio: "[BIO PLACEHOLDER] Dr. [DOCTOR NAME] focuses on internal medicine: in-house laboratory work, imaging interpretation and long-running cases that need steady follow-up.",
    photoKey: "/images/doctors/veterinarian-02.jpg",
    initials: "02",
    speciesFocus: ["dog", "cat", "small", "other"],
    languages: ["English"],
    sortOrder: 2,
    weekdayBlocks: [
      { weekday: 1, startTime: "12:30", endTime: "13:00", label: "Team break", reason: "break" },
      { weekday: 5, startTime: "09:00", endTime: "11:00", label: "Case review", reason: "meeting" },
    ],
  },
  {
    slug: "doctor-03",
    code: "03",
    name: "Dr. [DOCTOR NAME]",
    role: "Surgeon",
    specialization: { uz: "Jarrohlik va anesteziya", ru: "Хирургия и анестезия", en: "Surgery & Anaesthesia" },
    summary: "Orthopaedic and soft tissue surgery, anaesthesia planning.",
    bio: "[BIO PLACEHOLDER] Dr. [DOCTOR NAME] handles orthopaedic and soft tissue procedures, with an emphasis on anaesthesia safety and clear aftercare instructions.",
    photoKey: null,
    initials: "03",
    speciesFocus: ["dog", "cat", "small"],
    languages: ["English"],
    sortOrder: 3,
    weekdayBlocks: [
      { weekday: 1, startTime: "12:30", endTime: "13:00", label: "Team break", reason: "break" },
      { weekday: 2, startTime: "09:00", endTime: "13:00", label: "Theatre", reason: "surgery" },
      { weekday: 4, startTime: "09:00", endTime: "13:00", label: "Theatre", reason: "surgery" },
    ],
  },
  {
    slug: "doctor-04",
    code: "04",
    name: "Dr. [DOCTOR NAME]",
    role: "Dentistry Clinician",
    specialization: { uz: "Stomatologiya va og‘iz bo‘shlig‘i", ru: "Стоматология и полость рта", en: "Dentistry & Oral Care" },
    summary: "Oral health, dental charts and comfortable eating.",
    bio: "[BIO PLACEHOLDER] Dr. [DOCTOR NAME] works on oral health: dental charts, prophylaxis and extractions, and the home-care advice that prevents repeat procedures.",
    photoKey: null,
    initials: "04",
    speciesFocus: ["dog", "cat", "small"],
    languages: ["English"],
    sortOrder: 4,
    weekdayBlocks: [
      { weekday: 1, startTime: "12:30", endTime: "13:00", label: "Team break", reason: "break" },
      { weekday: 5, startTime: "14:00", endTime: "19:00", label: "Day off", reason: "day-off" },
    ],
  },
];

export const doctorPhoto = (key: string | null) => key;

/** Resolve a clinician's specialization for the current locale. */
export function specialtyOf(slug: string, locale: Locale): string {
  const seed = doctorSeeds.find((d) => d.slug === slug);
  return seed ? pickL(seed.specialization, locale) : "";
}
