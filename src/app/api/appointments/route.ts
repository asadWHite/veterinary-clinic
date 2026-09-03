import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db";
import { ensureDatabase } from "@/db/bootstrap";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointmentAnswers, appointments, notifications, pets, services, doctors } from "@/db/schema";
import { generatePublicId, getCurrentUser } from "@/lib/auth";
import { QUESTIONS, computeUrgency } from "@/lib/booking/questions";
import { resolveBookingContext } from "@/lib/booking/server";
import { slotsForDay } from "@/lib/booking/server";
import { pickLocalized, normalizeLocale } from "@/lib/i18n/config";
import type { ReasonKey, Species } from "@/lib/types";

export const dynamic = "force-dynamic";

type PayloadAnswer = { key: string; value: string };

type Payload = {
  locale?: string;
  serviceSlug?: string;
  doctorSlug?: string;
  day?: string;
  startMinute?: number;
  species?: Species;
  lifeStage?: string;
  reasonKey?: ReasonKey;
  answers?: PayloadAnswer[];
  client?: { name?: string; phone?: string; email?: string; notes?: string };
  pet?: { id?: number; name?: string; breed?: string; birthDate?: string; weightKg?: number };
};

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SPECIES: Species[] = ["dog", "cat", "other"];
const LIFE_STAGES = ["baby", "young", "adult", "senior"];
const REASONS = [
  "checkup",
  "vaccination",
  "something_wrong",
  "injury",
  "skin",
  "dental",
  "nutrition",
  "surgery",
  "other",
];

function digits(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const locale = normalizeLocale(payload.locale);
  const serviceSlug = String(payload.serviceSlug ?? "");
  const doctorSlug = String(payload.doctorSlug ?? "any");
  const day = String(payload.day ?? "");
  const startMinute = Number(payload.startMinute ?? -1);
  const species = payload.species;
  const lifeStage = String(payload.lifeStage ?? "adult");
  const reasonKey = String(payload.reasonKey ?? "other") as ReasonKey;
  const client = payload.client ?? {};
  const pet = payload.pet ?? {};

  if (
    !serviceSlug ||
    !DAY_PATTERN.test(day) ||
    !Number.isInteger(startMinute) ||
    startMinute < 0 ||
    startMinute > 24 * 60 ||
    !species ||
    !SPECIES.includes(species) ||
    !LIFE_STAGES.includes(lifeStage) ||
    !REASONS.includes(reasonKey)
  ) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const clientName = String(client.name ?? "").trim();
  const clientPhone = String(client.phone ?? "").trim();
  const clientEmail = String(client.email ?? "").trim();
  const clientNotes = String(client.notes ?? "").trim().slice(0, 2000);

  if (clientName.length < 2 || digits(clientPhone) < 7) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }
  if (clientEmail !== "" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clientEmail)) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const answers = (Array.isArray(payload.answers) ? payload.answers : [])
    .filter((entry) => typeof entry?.key === "string" && typeof entry?.value === "string")
    .filter((entry) => entry.key === "main_concern" || entry.key in QUESTIONS)
    .slice(0, 24)
    .map((entry) => ({
      key: entry.key.slice(0, 64),
      value: entry.value.slice(0, 2000),
    }));

  const answerMap: Record<string, string> = {};
  for (const entry of answers) answerMap[entry.key] = entry.value;

  if (!isDatabaseConfigured) {
    // Online booking submission requires the clinic database. Without it the
    // client shows the clinic phone numbers instead of pretending to book.
    return NextResponse.json({ error: "booking_offline" }, { status: 503 });
  }

  const bootstrap = await ensureDatabase();
  if (!bootstrap.ok) {
    return NextResponse.json({ error: "booking_offline" }, { status: 503 });
  }

  try {
    const context = await resolveBookingContext(
      serviceSlug,
      doctorSlug === "any" ? "any" : doctorSlug,
      locale,
    );
    if (!context) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Authoritative availability check on the server.
    const slots = await slotsForDay(context, day);
    const slot = slots.find((item) => item.minute === startMinute);
    if (!slot || slot.state !== "available" || slot.doctorIds.length === 0) {
      return NextResponse.json({ error: "slot_taken" }, { status: 409 });
    }

    const requestedDoctor =
      doctorSlug === "any"
        ? context.doctors.find((doctor) => slot.doctorIds.includes(doctor.id))
        : context.doctors.find((doctor) => doctor.slug === doctorSlug);
    if (!requestedDoctor || !slot.doctorIds.includes(requestedDoctor.id)) {
      return NextResponse.json({ error: "slot_taken" }, { status: 409 });
    }

    const user = await getCurrentUser();

    // Verify the pet belongs to the signed-in user.
    let petId: number | null = null;
    if (pet.id && user) {
      const rows = await db
        .select({ id: pets.id })
        .from(pets)
        .where(and(eq(pets.id, pet.id), eq(pets.userId, user.id)))
        .limit(1);
      petId = rows[0]?.id ?? null;
    }

    const endMinute = startMinute + context.durationMinutes;
    const urgency = computeUrgency(reasonKey, answerMap, lifeStage);
    const petName = String(pet.name ?? "").trim().slice(0, 80) || null;
    const publicId = generatePublicId();

    let createdId = 0;
    try {
      await db.transaction(async (tx) => {
        // Serialize concurrent bookings for the same doctor and day.
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`${requestedDoctor.id}:${day}`}))`);

        const conflicts = await tx
          .select({ id: appointments.id })
          .from(appointments)
          .where(
            and(
              eq(appointments.doctorId, requestedDoctor.id),
              eq(appointments.day, day),
              inArray(appointments.status, ["pending", "confirmed"]),
              sql`${appointments.startMinute} < ${endMinute} and ${appointments.endMinute} > ${startMinute}`,
            ),
          )
          .limit(1);

        if (conflicts.length > 0) {
          throw new Error("SLOT_TAKEN");
        }

        const inserted = await tx
          .insert(appointments)
          .values({
            publicId,
            userId: user?.id ?? null,
            petId,
            doctorId: requestedDoctor.id,
            serviceId: context.serviceId,
            day,
            startMinute,
            endMinute,
            durationMinutes: context.durationMinutes,
            status: "pending",
            urgency,
            reasonKey,
            species,
            lifeStage,
            petName,
            petBreed: String(pet.breed ?? "").trim().slice(0, 120) || null,
            notes: clientNotes || null,
            guestName: user ? null : clientName,
            guestPhone: user ? null : clientPhone,
            guestEmail: user ? null : clientEmail || null,
            clientName,
            clientPhone,
            clientEmail: clientEmail || null,
          })
          .returning({ id: appointments.id });
        createdId = inserted[0].id;

        if (answers.length > 0) {
          await tx.insert(appointmentAnswers).values(
            answers.map((entry, index) => ({
              appointmentId: createdId,
              stepIndex: index,
              questionKey: entry.key,
              answerValue: entry.value,
              isFreeText: (QUESTIONS[entry.key]?.type ?? "text") === "text",
            })),
          );
        }

        await tx.insert(notifications).values({
          userId: user?.id ?? null,
          appointmentId: createdId,
          type: "appointment_created",
          channel: "internal",
          payload: { publicId, day, startMinute, doctorId: requestedDoctor.id },
          status: "queued",
        });
      });
    } catch (error) {
      if (error instanceof Error && error.message === "SLOT_TAKEN") {
        return NextResponse.json({ error: "slot_taken" }, { status: 409 });
      }
      // A database exclusion constraint also surfaces as a conflict.
      const message = error instanceof Error ? error.message : "";
      if (message.includes("overlap") || message.includes("exclusion")) {
        return NextResponse.json({ error: "slot_taken" }, { status: 409 });
      }
      throw error;
    }

    const [serviceRow] = await db
      .select({ title: services.title })
      .from(services)
      .where(eq(services.id, context.serviceId))
      .limit(1);
    const [doctorRow] = await db
      .select({ name: doctors.name })
      .from(doctors)
      .where(eq(doctors.id, requestedDoctor.id))
      .limit(1);

    return NextResponse.json({
      ok: true,
      publicId,
      appointmentId: createdId,
      day,
      startMinute,
      endMinute,
      durationMinutes: context.durationMinutes,
      status: "pending",
      urgency,
      doctorName: doctorRow ? pickLocalized(doctorRow.name, locale) : "",
      serviceName: serviceRow ? pickLocalized(serviceRow.title, locale) : "",
      petName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const missingSchema = /relation .* does not exist|column .* does not exist|does not exist/i.test(message);
    if (missingSchema) {
      return NextResponse.json({ error: "booking_offline" }, { status: 503 });
    }
    console.error("[elvet] appointment creation failed:", message);
    return NextResponse.json({ error: "db" }, { status: 503 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "not_found" }, { status: 404 });
}
