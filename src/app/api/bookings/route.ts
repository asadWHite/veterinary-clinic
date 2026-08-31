import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, doctors, pets, services } from "@/db/schema";
import { assertSlotFree, minutesToTime, timeToMinutes, todayISO } from "@/lib/availability";
import { checkDatabase } from "@/db";
import { generatePublicId, getSessionUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

type BookingPayload = {
  doctorId?: string;
  serviceSlug?: string;
  date?: string;
  startTime?: string;
  petId?: string | null;
  petName?: string;
  species?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  notes?: string;
  urgency?: string;
  answers?: Record<string, string | string[]>;
};

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ appointments: [] });

  const rows = await db
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
      serviceName: services.name,
    })
    .from(appointments)
    .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .where(eq(appointments.userId, user.id))
    .orderBy(desc(appointments.date), desc(appointments.startTime));

  return NextResponse.json({ appointments: rows });
}

export async function POST(request: Request) {
  const status = await checkDatabase();
  if (!status.ok) {
    return NextResponse.json(
      { error: "Database unavailable. Please try again later.", code: "database-unavailable" },
      { status: 503 },
    );
  }

  await ensureSeeded();

  let payload: BookingPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const user = await getSessionUser();

  const doctorId = payload.doctorId ?? "";
  const serviceSlug = payload.serviceSlug ?? "";
  const date = payload.date ?? "";
  const startTime = payload.startTime ?? "";
  const petName = (payload.petName ?? "").trim();
  const species = payload.species ?? "dog";
  const ownerName = (payload.ownerName ?? "").trim();
  const ownerPhone = (payload.ownerPhone ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(startTime))
    return NextResponse.json({ error: "Please choose a date and time." }, { status: 400 });
  if (petName.length < 1) return NextResponse.json({ error: "Please add a name." }, { status: 400 });
  if (ownerName.length < 2)
    return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  if (ownerPhone.length < 5)
    return NextResponse.json({ error: "Please add a phone number." }, { status: 400 });

  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.slug, serviceSlug))
    .limit(1);
  if (!service) return NextResponse.json({ error: "Unknown service." }, { status: 400 });

  const [doctor] = await db.select().from(doctors).where(eq(doctors.id, doctorId)).limit(1);
  if (!doctor) return NextResponse.json({ error: "Please choose a clinician." }, { status: 400 });

  if (date < todayISO())
    return NextResponse.json({ error: "That date has already passed." }, { status: 400 });

  // Re-check the slot against schedule, blocks and existing appointments.
  const guard = await assertSlotFree({
    doctorId,
    date,
    startTime,
    durationMinutes: service.durationMinutes,
  });
  if (!guard.ok)
    return NextResponse.json(
      {
        error:
          guard.reason === "past"
            ? "That time has already passed. Please choose another."
            : "This time was just booked. Please choose another.",
        code: "slot-taken",
      },
      { status: 409 },
    );

  // Pets belong to their owner only.
  let petId: string | null = null;
  if (payload.petId) {
    const [pet] = await db
      .select({ id: pets.id })
      .from(pets)
      .where(and(eq(pets.id, payload.petId), eq(pets.userId, user?.id ?? "")))
      .limit(1);
    petId = pet?.id ?? null;
  }

  const endTime = minutesToTime(timeToMinutes(startTime) + service.durationMinutes);

  try {
    const [created] = await db
      .insert(appointments)
      .values({
        publicId: generatePublicId(),
        userId: user?.id ?? null,
        petId,
        doctorId,
        serviceId: service.id,
        date,
        startTime,
        endTime,
        durationMinutes: service.durationMinutes,
        status: "confirmed",
        urgency: payload.urgency ?? null,
        ownerName,
        ownerEmail: (payload.ownerEmail ?? user?.email ?? "").trim() || null,
        ownerPhone,
        petName,
        species,
        notes: (payload.notes ?? "").trim() || null,
        answers: payload.answers ?? {},
      })
      .returning({ id: appointments.id, publicId: appointments.publicId });

    return NextResponse.json({
      ok: true,
      appointment: {
        id: created.id,
        publicId: created.publicId,
        date,
        startTime,
        endTime,
        durationMinutes: service.durationMinutes,
        serviceName: service.name,
        doctorName: doctor.name,
        petName,
        species,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "This time was just booked. Please choose another.", code: "slot-taken" },
        { status: 409 },
      );
    }
    console.error("[bookings] insert failed", error);
    return NextResponse.json({ error: "Could not save the appointment." }, { status: 500 });
  }
}
