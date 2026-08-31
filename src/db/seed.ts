import { sql } from "drizzle-orm";
import { db, isDatabaseDown } from "@/db";
import { appointments, availabilityRules, blockedSlots, doctors, services } from "@/db/schema";
import { doctorSeeds } from "@/data/doctors";
import { serviceSeeds } from "@/data/services";
import { addDaysISO, todayISO } from "@/lib/availability";
import { generatePublicId } from "@/lib/auth";

/** Clinic opening hours: Monday–Saturday, closed Sunday. */
const OPEN_WEEKDAYS = [1, 2, 3, 4, 5, 6];
const OPEN = "09:00";
const CLOSE = "19:00";

let seedPromise: Promise<void> | null = null;

/** Idempotent bootstrap so the preview always has a usable clinic. */
export function ensureSeeded(): Promise<void> {
  if (isDatabaseDown()) return Promise.resolve();
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      console.error("[seed] failed", error);
    });
  }
  return seedPromise;
}

async function runSeed(): Promise<void> {
  const existing = await db.select({ id: doctors.id }).from(doctors).limit(1);
  if (existing.length > 0) return;

  await db.transaction(async (tx) => {
    const insertedServices = await tx
      .insert(services)
      .values(
        serviceSeeds.map((service) => ({
          slug: service.slug,
          name: service.name.en,
          category: service.category.en,
          summary: service.summary.en,
          description: service.description.en,
          durationMinutes: service.durationMinutes,
          priceFrom: service.priceFrom,
          sortOrder: service.sortOrder,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: services.id, slug: services.slug, duration: services.durationMinutes });

    const insertedDoctors = await tx
      .insert(doctors)
      .values(
        doctorSeeds.map((d) => ({
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
          sortOrder: d.sortOrder,
        })),
      )
      .onConflictDoNothing()
      .returning({ id: doctors.id, slug: doctors.slug });

    const rules = insertedDoctors.flatMap((doc) =>
      OPEN_WEEKDAYS.map((weekday) => ({
        doctorId: doc.id,
        weekday,
        startTime: OPEN,
        endTime: CLOSE,
      })),
    );
    if (rules.length > 0) await tx.insert(availabilityRules).values(rules);

    const blocks = insertedDoctors.flatMap((doc) => {
      const seed = doctorSeeds.find((d) => d.slug === doc.slug);
      if (!seed) return [];
      return seed.weekdayBlocks.map((b) => ({
        doctorId: doc.id,
        date: null,
        weekday: b.weekday,
        startTime: b.startTime,
        endTime: b.endTime,
        label: b.label,
        reason: b.reason,
      }));
    });
    if (blocks.length > 0) await tx.insert(blockedSlots).values(blocks);

    // A realistic day: some slots already taken, so BOOKED / BLOCKED states are real.
    const general = insertedServices.find((s) => s.slug === "general-examination");
    const diagnostic = insertedServices.find((s) => s.slug === "diagnostic-consultation");
    const doctor01 = insertedDoctors.find((d) => d.slug === "doctor-01");
    const doctor02 = insertedDoctors.find((d) => d.slug === "doctor-02");
    const doctor03 = insertedDoctors.find((d) => d.slug === "doctor-03");

    const today = todayISO();
    const demoAppointments: {
      doctorId: string;
      serviceId: string;
      date: string;
      startTime: string;
      endTime: string;
      durationMinutes: number;
      petName: string;
      species: string;
      ownerName: string;
      ownerPhone: string;
    }[] = [];

    const push = (
      doctorId: string | undefined,
      serviceId: string | undefined,
      date: string,
      startTime: string,
      duration: number,
      petName: string,
      species: string,
    ) => {
      if (!doctorId || !serviceId) return;
      const [h, m] = startTime.split(":").map(Number);
      const endMinutes = h * 60 + m + duration;
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(
        endMinutes % 60,
      ).padStart(2, "0")}`;
      demoAppointments.push({
        doctorId,
        serviceId,
        date,
        startTime,
        endTime,
        durationMinutes: duration,
        petName,
        species,
        ownerName: "[OWNER NAME]",
        ownerPhone: "[PHONE]",
      });
    };

    const d1 = addDaysISO(today, 1);
    const d2 = addDaysISO(today, 3);
    const d5 = addDaysISO(today, 6);

    push(doctor01?.id, general?.id, d1, "09:30", 30, "[PET NAME]", "dog");
    push(doctor01?.id, general?.id, d1, "11:00", 30, "[PET NAME]", "cat");
    push(doctor01?.id, diagnostic?.id, d1, "14:30", 45, "[PET NAME]", "dog");
    push(doctor01?.id, general?.id, d2, "10:00", 30, "[PET NAME]", "small");
    push(doctor02?.id, diagnostic?.id, d2, "13:30", 45, "[PET NAME]", "cat");
    push(doctor02?.id, general?.id, d2, "16:00", 30, "[PET NAME]", "dog");
    push(doctor03?.id, general?.id, d5, "15:00", 30, "[PET NAME]", "dog");
    push(doctor02?.id, diagnostic?.id, d5, "17:30", 45, "[PET NAME]", "cat");

    if (demoAppointments.length > 0) {
      await tx.insert(appointments).values(
        demoAppointments.map((a) => ({ ...a, publicId: generatePublicId() })),
      );
    }

    // One dated block so UNAVAILABLE is visible even on a doctor's normal day.
    if (doctor02?.id) {
      await tx.insert(blockedSlots).values({
        doctorId: doctor02.id,
        date: addDaysISO(today, 2),
        weekday: null,
        startTime: "09:00",
        endTime: "12:00",
        label: "Conference",
        reason: "meeting",
      });
    }
  });
}

export async function clinicStats() {
  const [row] = await db
    .select({
      doctors: sql<number>`(select count(*)::int from ${doctors})`,
      services: sql<number>`(select count(*)::int from ${services})`,
    })
    .from(sql`(select 1) as t`);
  return row ?? { doctors: 0, services: 0 };
}
