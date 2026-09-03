import { and, asc, count, desc, eq, gte, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import {
  appointmentAnswers,
  appointments,
  availability,
  blockedSlots,
  doctorServices,
  doctors,
  favorites,
  journalPosts,
  pets,
  profiles,
  reviews,
  services,
  vaccinations,
  type Appointment,
  type AppointmentAnswer,
  type Doctor,
  type JournalPost,
  type Pet,
} from "@/db/schema";
import { pickLocalized, type Locale } from "@/lib/i18n/config";
import type { AppointmentStatus, DoctorCard, ServiceCard, Urgency } from "@/lib/types";
import { isDatabaseConfigured } from "@/db";
import { ensureDatabase } from "@/db/bootstrap";
import { offlineDoctors, offlineJournal, offlineServices } from "@/lib/clinic";

/**
 * Reads fall back to the bundled ELVET clinic content when no database is
 * configured or the connection fails, so the public site always renders.
 * The first call also provisions the schema on an empty database.
 */
async function withFallback<T>(run: () => Promise<T>, fallback: () => T): Promise<T> {
  if (!isDatabaseConfigured) return fallback();
  const bootstrap = await ensureDatabase();
  if (!bootstrap.ok) return fallback();
  try {
    return await run();
  } catch (error) {
    console.warn(
      "[elvet] database read failed, using bundled clinic content:",
      error instanceof Error ? error.message : error,
    );
    return fallback();
  }
}

/* ------------------------------------------------------------------ services */

export const getServices = cache(async (locale: Locale): Promise<ServiceCard[]> =>
  withFallback(
    async () => {
      const rows = await db
        .select()
        .from(services)
        .where(eq(services.isPublished, true))
        .orderBy(asc(services.sortOrder));
      if (rows.length === 0) return offlineServices(locale);
      return rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: pickLocalized(row.title, locale),
        summary: pickLocalized(row.summary, locale),
        description: pickLocalized(row.description, locale),
        durationMinutes: row.durationMinutes,
        sortOrder: row.sortOrder,
      }));
    },
    () => offlineServices(locale),
  ),
);

export const getServiceBySlug = cache(async (slug: string, locale: Locale): Promise<ServiceCard | null> => {
  const offline = offlineServices(locale).find((service) => service.slug === slug) ?? null;
  return withFallback(
    async () => {
      const rows = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
      const row = rows[0];
      if (!row) return offline;
      return {
        id: row.id,
        slug: row.slug,
        title: pickLocalized(row.title, locale),
        summary: pickLocalized(row.summary, locale),
        description: pickLocalized(row.description, locale),
        durationMinutes: row.durationMinutes,
        sortOrder: row.sortOrder,
      } satisfies ServiceCard;
    },
    () => offline,
  );
});

/* ------------------------------------------------------------------- doctors */

type DoctorRow = Doctor;

export const getDoctors = cache(async (locale: Locale): Promise<DoctorCard[]> =>
  withFallback(
    async () => {
      const [rows, links, reviewAgg, rules] = await Promise.all([
        db
          .select()
          .from(doctors)
          .where(eq(doctors.isPublished, true))
          .orderBy(asc(doctors.sortOrder), asc(doctors.id)),
        db
          .select({ doctorId: doctorServices.doctorId, slug: services.slug })
          .from(doctorServices)
          .innerJoin(services, eq(services.id, doctorServices.serviceId)),
        db
          .select({
            doctorId: reviews.doctorId,
            total: count(reviews.id),
            average: sql<number | null>`avg(${reviews.rating})`,
          })
          .from(reviews)
          .where(eq(reviews.status, "approved"))
          .groupBy(reviews.doctorId),
        db.select().from(availability).where(eq(availability.isActive, true)),
      ]);
      if (rows.length === 0) return offlineDoctors(locale);

      return rows.map((row: DoctorRow) => {
        const agg = reviewAgg.find((item) => item.doctorId === row.id);
        const total = Number(agg?.total ?? 0);
        return {
          id: row.id,
          slug: row.slug,
          name: pickLocalized(row.name, locale),
          title: pickLocalized(row.title, locale),
          bio: pickLocalized(row.bio, locale),
          photoUrl: row.photoUrl,
          experienceYears: row.experienceYears,
          languages: row.languages ?? [],
          isPlaceholder: row.isPlaceholder,
          serviceSlugs: links.filter((link) => link.doctorId === row.id).map((link) => link.slug),
          reviewCount: total,
          averageRating: total > 0 ? Number(agg?.average ?? 0) : null,
          weekdayBits: rules
            .filter((rule) => rule.doctorId === row.id && rule.kind === "work")
            .reduce((bits, rule) => bits | (1 << rule.weekday), 0),
        };
      });
    },
    () => offlineDoctors(locale),
  ),
);

export const getDoctorBySlug = cache(async (slug: string, locale: Locale): Promise<DoctorCard | null> => {
  const all = await getDoctors(locale);
  return all.find((doctor) => doctor.slug === slug) ?? null;
});

export const getDoctorsForService = cache(async (serviceSlug: string, locale: Locale) => {
  const all = await getDoctors(locale);
  return all.filter((doctor) => doctor.serviceSlugs.includes(serviceSlug));
});

/* ------------------------------------------------------------------- journal */

export type JournalCard = {
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

function toJournalCard(row: JournalPost, locale: Locale): JournalCard {
  return {
    id: row.id,
    slug: row.slug,
    title: pickLocalized(row.title, locale),
    excerpt: pickLocalized(row.excerpt, locale),
    body: pickLocalized(row.body, locale),
    categoryKey: row.categoryKey,
    coverUrl: row.coverUrl,
    readingMinutes: row.readingMinutes,
    publishedAt: row.publishedAt,
  };
}

export const getJournalPosts = cache(async (locale: Locale, limit?: number): Promise<JournalCard[]> =>
  withFallback(
    async () => {
      const query = db
        .select()
        .from(journalPosts)
        .where(eq(journalPosts.isPublished, true))
        .orderBy(desc(journalPosts.publishedAt));
      const rows = limit ? await query.limit(limit) : await query;
      if (rows.length === 0) return offlineJournal(locale).slice(0, limit);
      return rows.map((row) => toJournalCard(row, locale));
    },
    () => offlineJournal(locale).slice(0, limit),
  ),
);

export const getJournalPostBySlug = cache(async (slug: string, locale: Locale): Promise<JournalCard | null> => {
  const offline = offlineJournal(locale).find((post) => post.slug === slug) ?? null;
  return withFallback(
    async () => {
      const rows = await db.select().from(journalPosts).where(eq(journalPosts.slug, slug)).limit(1);
      const row = rows[0];
      return row ? toJournalCard(row, locale) : offline;
    },
    () => offline,
  );
});

/* ------------------------------------------------------------------- reviews */

export type PublicReview = {
  id: number;
  rating: number;
  body: string;
  createdAt: Date;
  authorName: string;
  doctorName: string;
  doctorSlug: string;
};

export const getApprovedReviews = cache(async (limit = 12): Promise<PublicReview[]> =>
  withFallback(
    async () => {
      const rows = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          body: reviews.body,
          createdAt: reviews.createdAt,
          authorName: profiles.fullName,
          doctorId: doctors.id,
        })
        .from(reviews)
        .innerJoin(profiles, eq(profiles.id, reviews.userId))
        .innerJoin(doctors, eq(doctors.id, reviews.doctorId))
        .where(eq(reviews.status, "approved"))
        .orderBy(desc(reviews.createdAt))
        .limit(limit);

      const doctorRows = rows.length
        ? await db
            .select({ id: doctors.id, name: doctors.name, slug: doctors.slug })
            .from(doctors)
            .where(inArray(doctors.id, Array.from(new Set(rows.map((row) => row.doctorId)))))
        : [];

      return rows.map((row) => {
        const doctor = doctorRows.find((item) => item.id === row.doctorId);
        return {
          id: row.id,
          rating: row.rating,
          body: row.body,
          createdAt: row.createdAt,
          authorName: row.authorName,
          doctorName: doctor ? pickLocalized(doctor.name, "uz") : "",
          doctorSlug: doctor?.slug ?? "",
        };
      });
    },
    () => [],
  ),
);

/* -------------------------------------------------------------- account data */

export async function getPets(userId: number): Promise<Pet[]> {
  return db.select().from(pets).where(eq(pets.userId, userId)).orderBy(asc(pets.id));
}

export type AppointmentRow = Appointment & {
  serviceTitle: string;
  doctorName: string;
  doctorSlug: string;
  petName: string | null;
};

export async function getUserAppointments(userId: number, locale: Locale): Promise<AppointmentRow[]> {
  const rows = await db
    .select({
      appointment: appointments,
      serviceTitle: services.title,
      doctorName: doctors.name,
      doctorSlug: doctors.slug,
      petName: pets.name,
    })
    .from(appointments)
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
    .leftJoin(pets, eq(pets.id, appointments.petId))
    .where(eq(appointments.userId, userId))
    .orderBy(desc(appointments.day), desc(appointments.startMinute));

  return rows.map((row) => ({
    ...row.appointment,
    serviceTitle: pickLocalized(row.serviceTitle, locale),
    doctorName: pickLocalized(row.doctorName, locale),
    doctorSlug: row.doctorSlug,
    petName: row.petName ?? row.appointment.petName,
  }));
}

export async function getFavoriteDoctorIds(userId: number): Promise<number[]> {
  const rows = await db
    .select({ doctorId: favorites.doctorId })
    .from(favorites)
    .where(eq(favorites.userId, userId));
  return rows.map((row) => row.doctorId);
}

export async function getUserReviews(userId: number, locale: Locale) {
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      body: reviews.body,
      status: reviews.status,
      createdAt: reviews.createdAt,
      doctorName: doctors.name,
    })
    .from(reviews)
    .innerJoin(doctors, eq(doctors.id, reviews.doctorId))
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.createdAt));
  return rows.map((row) => ({ ...row, doctorName: pickLocalized(row.doctorName, locale) }));
}

/** Completed appointments that do not have a review yet. */
export async function getReviewableAppointments(userId: number, locale: Locale = "uz") {
  const rows = await db
    .select({
      id: appointments.id,
      publicId: appointments.publicId,
      day: appointments.day,
      doctorName: doctors.name,
    })
    .from(appointments)
    .leftJoin(reviews, eq(reviews.appointmentId, appointments.id))
    .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
    .where(
      and(
        eq(appointments.userId, userId),
        eq(appointments.status, "completed"),
        isNull(reviews.id),
      ),
    )
    .orderBy(desc(appointments.day));
  return rows.map((row) => ({ ...row, doctorName: pickLocalized(row.doctorName, locale) }));
}

export async function getVaccinationReminders(userId: number, locale: Locale) {
  const rows = await db
    .select({
      id: vaccinations.id,
      vaccineKey: vaccinations.vaccineKey,
      nextDueAt: vaccinations.nextDueAt,
      petName: pets.name,
    })
    .from(vaccinations)
    .innerJoin(pets, eq(pets.id, vaccinations.petId))
    .where(eq(pets.userId, userId))
    .orderBy(asc(vaccinations.nextDueAt));
  return rows.map((row) => ({ ...row, petName: row.petName ?? "" }));
}

/* --------------------------------------------------------------- admin data */

export type AdminAppointmentFilters = {
  search?: string;
  dayFrom?: string;
  dayTo?: string;
  doctorId?: number;
  serviceId?: number;
  status?: AppointmentStatus;
  urgency?: Urgency;
  scopeDoctorId?: number;
  limit?: number;
};

export type AdminAppointmentRow = Appointment & {
  serviceTitle: string;
  doctorName: string;
  petPhotoUrl: string | null;
  petBirthDate: string | null;
  petBreed: string | null;
  answerCount: number;
};

export async function getAdminAppointments(
  filters: AdminAppointmentFilters,
  locale: Locale,
): Promise<AdminAppointmentRow[]> {
  const conditions = [];
  if (filters.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      or(
        sql`lower(${appointments.clientName}) like ${term}`,
        sql`lower(coalesce(${appointments.clientPhone}, '')) like ${term}`,
        sql`lower(coalesce(${appointments.clientEmail}, '')) like ${term}`,
        sql`lower(coalesce(${appointments.petName}, '')) like ${term}`,
        sql`lower(${appointments.publicId}) like ${term}`,
      ),
    );
  }
  if (filters.dayFrom) conditions.push(gte(appointments.day, filters.dayFrom));
  if (filters.dayTo) conditions.push(lte(appointments.day, filters.dayTo));
  if (filters.doctorId) conditions.push(eq(appointments.doctorId, filters.doctorId));
  if (filters.scopeDoctorId) conditions.push(eq(appointments.doctorId, filters.scopeDoctorId));
  if (filters.serviceId) conditions.push(eq(appointments.serviceId, filters.serviceId));
  if (filters.status) conditions.push(eq(appointments.status, filters.status));
  if (filters.urgency) conditions.push(eq(appointments.urgency, filters.urgency));

  const rows = await db
    .select({
      appointment: appointments,
      serviceTitle: services.title,
      doctorName: doctors.name,
      petPhotoUrl: pets.photoUrl,
      petBirthDate: pets.birthDate,
      petBreed: pets.breed,
    })
    .from(appointments)
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
    .leftJoin(pets, eq(pets.id, appointments.petId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(appointments.day), asc(appointments.startMinute))
    .limit(filters.limit ?? 200);

  const answerCounts = rows.length
    ? await db
        .select({ appointmentId: appointmentAnswers.appointmentId, total: count(appointmentAnswers.id) })
        .from(appointmentAnswers)
        .where(inArray(appointmentAnswers.appointmentId, rows.map((row) => row.appointment.id)))
        .groupBy(appointmentAnswers.appointmentId)
    : [];

  return rows.map((row) => ({
    ...row.appointment,
    serviceTitle: pickLocalized(row.serviceTitle, locale),
    doctorName: pickLocalized(row.doctorName, locale),
    petPhotoUrl: row.petPhotoUrl ?? null,
    petBirthDate: row.petBirthDate ?? row.appointment.petBreed ?? null,
    petBreed: row.petBreed ?? row.appointment.petBreed ?? null,
    answerCount: Number(
      answerCounts.find((item) => item.appointmentId === row.appointment.id)?.total ?? 0,
    ),
  }));
}

export type AppointmentDetail = {
  appointment: Appointment;
  serviceTitle: string;
  serviceSlug: string;
  doctorName: string;
  doctorSlug: string;
  pet: Pet | null;
  answers: AppointmentAnswer[];
  userEmail: string | null;
};

export async function getAppointmentDetail(
  appointmentId: number,
  locale: Locale,
): Promise<AppointmentDetail | null> {
  const rows = await db
    .select({
      appointment: appointments,
      serviceTitle: services.title,
      serviceSlug: services.slug,
      doctorName: doctors.name,
      doctorSlug: doctors.slug,
      pet: pets,
      userEmail: profiles.email,
    })
    .from(appointments)
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
    .leftJoin(pets, eq(pets.id, appointments.petId))
    .leftJoin(profiles, eq(profiles.id, appointments.userId))
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const answers = await db
    .select()
    .from(appointmentAnswers)
    .where(eq(appointmentAnswers.appointmentId, appointmentId))
    .orderBy(asc(appointmentAnswers.stepIndex), asc(appointmentAnswers.id));

  return {
    appointment: row.appointment,
    serviceTitle: pickLocalized(row.serviceTitle, locale),
    serviceSlug: row.serviceSlug,
    doctorName: pickLocalized(row.doctorName, locale),
    doctorSlug: row.doctorSlug,
    pet: row.pet ?? null,
    answers,
    userEmail: row.userEmail ?? null,
  };
}

export async function getAppointmentByPublicId(publicId: string) {
  const rows = await db
    .select()
    .from(appointments)
    .where(eq(appointments.publicId, publicId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getStatusCounts(scopeDoctorId?: number) {
  const rows = await db
    .select({ status: appointments.status, total: count(appointments.id) })
    .from(appointments)
    .where(scopeDoctorId ? eq(appointments.doctorId, scopeDoctorId) : undefined)
    .groupBy(appointments.status);
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = Number(row.total);
    return acc;
  }, {});
}

export async function getDoctorScheduleRules(doctorId: number) {
  return db
    .select()
    .from(availability)
    .where(eq(availability.doctorId, doctorId))
    .orderBy(asc(availability.weekday), asc(availability.startMinute));
}

export async function getDoctorBlockedSlots(doctorId: number) {
  return db
    .select()
    .from(blockedSlots)
    .where(eq(blockedSlots.doctorId, doctorId))
    .orderBy(asc(blockedSlots.day), asc(blockedSlots.startMinute));
}

export async function getAdminReviews() {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      body: reviews.body,
      status: reviews.status,
      createdAt: reviews.createdAt,
      authorName: profiles.fullName,
      doctorName: doctors.name,
      appointmentId: reviews.appointmentId,
    })
    .from(reviews)
    .innerJoin(profiles, eq(profiles.id, reviews.userId))
    .innerJoin(doctors, eq(doctors.id, reviews.doctorId))
    .orderBy(desc(reviews.createdAt));
}
