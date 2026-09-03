import { and, eq, inArray } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { doctorServices, doctors, services } from "@/db/schema";
import { getAvailabilityForDay } from "@/lib/booking/availability";
import { pickLocalized, type Locale } from "@/lib/i18n/config";
import { getClinicSettings } from "@/lib/settings";
import { CLINIC, offlineDoctors, offlineServices } from "@/lib/clinic";

export type BookingDoctorOption = { id: number; slug: string; name: string; title: string };

export type BookingContext = {
  serviceId: number;
  serviceSlug: string;
  durationMinutes: number;
  doctors: BookingDoctorOption[];
  doctorIds: number[];
  timezone: string;
};

/** Resolves which service is booked and which doctors can provide it. */
function offlineContext(
  serviceSlug: string,
  doctorSlug: string | "any",
  locale: Locale,
): BookingContext | null {
  const service = offlineServices(locale).find((item) => item.slug === serviceSlug);
  if (!service) return null;
  const doctors = offlineDoctors(locale)
    .filter((doctor) => (doctorSlug === "any" ? true : doctor.slug === doctorSlug))
    .filter((doctor) => doctor.serviceSlugs.includes(serviceSlug))
    .map((doctor) => ({ id: doctor.id, slug: doctor.slug, name: doctor.name, title: doctor.title }));
  if (doctors.length === 0) return null;
  return {
    serviceId: service.id,
    serviceSlug: service.slug,
    durationMinutes: service.durationMinutes,
    doctors,
    doctorIds: doctors.map((doctor) => doctor.id),
    timezone: CLINIC.timezone,
  };
}

export async function resolveBookingContext(
  serviceSlug: string,
  doctorSlug: string | "any",
  locale: Locale,
): Promise<BookingContext | null> {
  if (!isDatabaseConfigured) return offlineContext(serviceSlug, doctorSlug, locale);
  const serviceRows = await db
    .select()
    .from(services)
    .where(and(eq(services.slug, serviceSlug), eq(services.isPublished, true)))
    .limit(1);
  const service = serviceRows[0];
  if (!service) return null;

  const doctorRows = await db
    .select({
      id: doctors.id,
      slug: doctors.slug,
      name: doctors.name,
      title: doctors.title,
      isPublished: doctors.isPublished,
    })
    .from(doctorServices)
    .innerJoin(doctors, eq(doctors.id, doctorServices.doctorId))
    .where(
      and(
        eq(doctorServices.serviceId, service.id),
        eq(doctors.isPublished, true),
        doctorSlug === "any" ? eq(doctors.isPublished, true) : eq(doctors.slug, doctorSlug),
      ),
    );

  const options = doctorRows
    .filter((row) => row.isPublished)
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: pickLocalized(row.name, locale),
      title: pickLocalized(row.title, locale),
    }));

  if (options.length === 0) return null;

  const settings = await getClinicSettings();

  return {
    serviceId: service.id,
    serviceSlug: service.slug,
    durationMinutes: service.durationMinutes,
    doctors: options,
    doctorIds: options.map((option) => option.id),
    timezone: settings.timezone,
  };
}

export async function slotsForDay(context: BookingContext, day: string) {
  return getAvailabilityForDay({
    day,
    durationMinutes: context.durationMinutes,
    doctorIds: context.doctorIds,
    timezone: context.timezone,
  });
}

export async function doctorIdsForSlugs(slugs: string[]): Promise<number[]> {
  if (slugs.length === 0) return [];
  const rows = await db.select({ id: doctors.id }).from(doctors).where(inArray(doctors.slug, slugs));
  return rows.map((row) => row.id);
}
