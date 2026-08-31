import { asc, eq } from "drizzle-orm";
import { db, safeQuery } from "@/db";
import { appointments, doctors, pets, services } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { doctorSeeds } from "@/data/doctors";
import { serviceSeeds } from "@/data/services";
import { findNextAvailable, getAvailabilityRange, todayISO } from "@/lib/availability";

export type DoctorWithNext = {
  id: string;
  slug: string;
  code: string;
  name: string;
  role: string;
  specialization: string;
  summary: string;
  bio: string;
  photoKey: string | null;
  initials: string;
  speciesFocus: string[];
  languages: string[];
  next: { date: string; time: string } | null;
};

/**
 * Static fallback so the marketing pages stay complete and the site keeps
 * rendering when the database is unreachable (for example on a fresh deploy
 * where DATABASE_URL has not been configured yet).
 */
const fallbackDoctors: DoctorWithNext[] = doctorSeeds.map((d) => ({
  id: `offline-${d.slug}`,
  slug: d.slug,
  code: d.code,
  name: d.name,
  role: d.role,
  specialization: d.specialization.en,
  summary: d.summary,
  bio: d.bio,
  photoKey: d.photoKey,
  initials: d.initials,
  speciesFocus: d.speciesFocus,
  languages: d.languages,
  next: null,
}));

const fallbackServices = serviceSeeds.map((s) => ({
  id: `offline-${s.slug}`,
  slug: s.slug,
  name: s.name,
  category: s.category,
  summary: s.summary,
  description: s.description,
  durationMinutes: s.durationMinutes,
  priceFrom: s.priceFrom,
  sortOrder: s.sortOrder,
}));

export type LocalizedService = (typeof fallbackServices)[number];

export async function getDoctors(): Promise<DoctorWithNext[]> {
  await ensureSeeded();
  const rows = await safeQuery(
    () => db.select().from(doctors).where(eq(doctors.active, true)).orderBy(asc(doctors.sortOrder)),
    [],
    "getDoctors",
  );
  if (rows.length === 0) return fallbackDoctors;

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    code: r.code,
    name: r.name,
    role: r.role,
    specialization: r.specialization,
    summary: r.summary,
    bio: r.bio,
    photoKey: r.photoKey,
    initials: r.initials,
    speciesFocus: r.speciesFocus ?? [],
    languages: r.languages ?? [],
    next: null,
  }));
}

export async function getDoctorsWithAvailability(
  durationMinutes = 30,
): Promise<DoctorWithNext[]> {
  const docs = await getDoctors();

  const range = await safeQuery(
    () =>
      getAvailabilityRange({
        doctorIds: docs.map((d) => d.id),
        startDate: todayISO(),
        days: 14,
        durationMinutes,
      }),
    {},
    "getAvailabilityRange",
  );

  const next = findNextAvailable(range);
  return docs.map((d) => ({ ...d, next: next[d.id] ?? null }));
}

export async function getServices(): Promise<LocalizedService[]> {
  await ensureSeeded();
  const rows = await safeQuery(
    () => db.select().from(services).orderBy(asc(services.sortOrder)),
    [],
    "getServices",
  );
  if (rows.length === 0) return fallbackServices;

  return rows.map((row) => {
    const seed = fallbackServices.find((s) => s.slug === row.slug);
    return {
      id: row.id,
      slug: row.slug,
      name: seed?.name ?? fallbackServices[0].name,
      category: seed?.category ?? fallbackServices[0].category,
      summary: seed?.summary ?? fallbackServices[0].summary,
      description: seed?.description ?? fallbackServices[0].description,
      durationMinutes: row.durationMinutes,
      priceFrom: row.priceFrom,
      sortOrder: row.sortOrder,
    };
  });
}

export async function getServiceBySlug(slug: string) {
  const all = await getServices();
  return all.find((s) => s.slug === slug) ?? null;
}

export async function getUpcomingForUser(userId: string) {
  const today = todayISO();
  const rows = await safeQuery(
    () =>
      db
        .select({
          id: appointments.id,
          publicId: appointments.publicId,
          date: appointments.date,
          startTime: appointments.startTime,
          endTime: appointments.endTime,
          durationMinutes: appointments.durationMinutes,
          status: appointments.status,
          petName: appointments.petName,
          species: appointments.species,
          doctorName: doctors.name,
          doctorCode: doctors.code,
          doctorSpecialization: doctors.specialization,
          serviceName: services.name,
        })
        .from(appointments)
        .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
        .innerJoin(services, eq(services.id, appointments.serviceId))
        .where(eq(appointments.userId, userId))
        .orderBy(asc(appointments.date), asc(appointments.startTime)),
    [],
    "getUpcomingForUser",
  );
  return rows.filter((r) => r.date >= today);
}

export async function getPetsForUser(userId: string) {
  return safeQuery(
    () => db.select().from(pets).where(eq(pets.userId, userId)).orderBy(asc(pets.createdAt)),
    [],
    "getPetsForUser",
  );
}
