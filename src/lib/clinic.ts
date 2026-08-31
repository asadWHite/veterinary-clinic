import { serviceBySlug } from "@/data/services";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, doctors, pets, services } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
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

export async function getDoctors(): Promise<DoctorWithNext[]> {
  await ensureSeeded();
  const rows = await db.select().from(doctors).where(eq(doctors.active, true)).orderBy(asc(doctors.sortOrder));
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

export async function getDoctorsWithAvailability(durationMinutes = 30): Promise<DoctorWithNext[]> {
  const docs = await getDoctors();
  if (docs.length === 0) return docs;
  const today = todayISO();
  const range = await getAvailabilityRange({
    doctorIds: docs.map((d) => d.id),
    startDate: today,
    days: 14,
    durationMinutes,
  });
  const next = findNextAvailable(range);
  return docs.map((d) => ({ ...d, next: next[d.id] ?? null }));
}

export type LocalizedService = {
  id: string;
  slug: string;
  name: ReturnType<typeof serviceBySlug>["name"];
  category: ReturnType<typeof serviceBySlug>["category"];
  summary: ReturnType<typeof serviceBySlug>["summary"];
  description: ReturnType<typeof serviceBySlug>["description"];
  durationMinutes: number;
  priceFrom: string;
  sortOrder: number;
};

/** One record per service; localized fields are resolved at render time. */
export async function getServices(): Promise<LocalizedService[]> {
  await ensureSeeded();
  const rows = await db.select().from(services).orderBy(asc(services.sortOrder));
  return rows.map((row) => {
    const seed = serviceBySlug(row.slug);
    return {
      id: row.id,
      slug: row.slug,
      name: seed.name,
      category: seed.category,
      summary: seed.summary,
      description: seed.description,
      durationMinutes: row.durationMinutes,
      priceFrom: row.priceFrom,
      sortOrder: row.sortOrder,
    };
  });
}

export async function getServiceBySlug(slug: string) {
  await ensureSeeded();
  const rows = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getUpcomingForUser(userId: string) {
  const today = todayISO();
  return db
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
    .orderBy(asc(appointments.date), asc(appointments.startTime))
    .then((rows) => rows.filter((r) => r.date >= today));
}

export async function getPetsForUser(userId: string) {
  return db.select().from(pets).where(eq(pets.userId, userId)).orderBy(asc(pets.createdAt));
}
