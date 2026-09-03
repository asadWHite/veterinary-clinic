import { cache } from "react";
import { db, isDatabaseConfigured } from "@/db";
import { clinicSettings } from "@/db/schema";
import type { LocalizedText } from "@/db/schema";
import { CLINIC, type Locale } from "@/lib/clinic";

export type ClinicSettingsValues = {
  clinicName: LocalizedText | null;
  phone: string | null;
  phone2: string | null;
  email: string | null;
  address: LocalizedText | null;
  hours: LocalizedText | null;
  emergencyPhone: string | null;
  instagram: string | null;
  lastAppointment: string | null;
  timezone: string;
};

export const CLINIC_SETTING_KEYS = [
  "clinicName",
  "phone",
  "phone2",
  "email",
  "address",
  "hours",
  "emergencyPhone",
  "instagram",
  "lastAppointment",
  "timezone",
] as const;

export type ClinicSettingKey = (typeof CLINIC_SETTING_KEYS)[number];

/** Real ELVET values — used as defaults whenever the database has no override. */
function elvetDefaults(): ClinicSettingsValues {
  return {
    clinicName: CLINIC.fullName,
    phone: CLINIC.phones[0] ?? null,
    phone2: CLINIC.phones[1] ?? null,
    email: CLINIC.email || null,
    address: CLINIC.address,
    hours: CLINIC.hours,
    emergencyPhone: CLINIC.phones[0] ?? null,
    instagram: CLINIC.instagramHandle,
    lastAppointment: CLINIC.lastAppointment,
    timezone: CLINIC.timezone,
  };
}

function asLocalized(value: unknown): LocalizedText | null {
  if (value && typeof value === "object" && "uz" in (value as object)) {
    const localized = value as LocalizedText;
    return localized.uz || localized.ru || localized.en ? localized : null;
  }
  return null;
}

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

/**
 * Clinic data is read from the database when it is configured, with the real
 * ELVET information as defaults. Nothing is hardcoded in the UI layer.
 */
export const getClinicSettings = cache(async (): Promise<ClinicSettingsValues> => {
  const defaults = elvetDefaults();
  if (!isDatabaseConfigured) return defaults;

  try {
    const rows = await db.select().from(clinicSettings);
    const map = new Map(rows.map((row) => [row.key, row.value]));
    const override = (key: string, current: string | null): string | null =>
      asText(map.get(key)) ?? current;
    return {
      clinicName: asLocalized(map.get("clinicName")) ?? defaults.clinicName,
      phone: override("phone", defaults.phone),
      phone2: override("phone2", defaults.phone2),
      email: override("email", defaults.email),
      address: asLocalized(map.get("address")) ?? defaults.address,
      hours: asLocalized(map.get("hours")) ?? defaults.hours,
      emergencyPhone: override("emergencyPhone", defaults.emergencyPhone),
      instagram: override("instagram", defaults.instagram),
      lastAppointment: override("lastAppointment", defaults.lastAppointment),
      timezone: override("timezone", defaults.timezone) ?? CLINIC.timezone,
    };
  } catch {
    return defaults;
  }
});

/** Renders a setting, falling back to a visible placeholder token. */
export function settingText(
  value: LocalizedText | string | null | undefined,
  locale: Locale,
  placeholder: string,
): string {
  if (!value) return placeholder;
  if (typeof value === "string") return value.trim() === "" ? placeholder : value;
  const localized = value[locale] || value.en || value.uz || value.ru;
  return localized && localized.trim() !== "" ? localized : placeholder;
}

/** Settings as a flat map of strings for display components. */
export function clinicContact(settings: ClinicSettingsValues) {
  return {
    phones: [settings.phone, settings.phone2].filter((value): value is string => Boolean(value)),
    phoneLinks: [settings.phone, settings.phone2]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.replace(/[^\d+]/g, "")),
    email: settings.email,
    instagram: settings.instagram,
    instagramUrl: settings.instagram
      ? `https://instagram.com/${settings.instagram.replace(/^@/, "")}`
      : CLINIC.instagramUrl,
  };
}
