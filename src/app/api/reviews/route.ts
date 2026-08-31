import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, reviews } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let payload: { appointmentId?: string; rating?: number; body?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const appointmentId = payload.appointmentId ?? "";
  const rating = Number(payload.rating ?? 0);
  if (!appointmentId) return NextResponse.json({ error: "Missing appointment." }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return NextResponse.json({ error: "Choose a rating between 1 and 5." }, { status: 400 });

  const [appointment] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.userId, user.id)))
    .limit(1);
  if (!appointment)
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  if (appointment.status !== "completed")
    return NextResponse.json(
      { error: "Only completed appointments can be reviewed." },
      { status: 400 },
    );

  const existing = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.appointmentId, appointmentId))
    .limit(1);
  if (existing.length > 0)
    return NextResponse.json({ error: "You already reviewed this visit." }, { status: 409 });

  const [review] = await db
    .insert(reviews)
    .values({
      appointmentId,
      userId: user.id,
      doctorId: appointment.doctorId,
      rating,
      body: (payload.body ?? "").trim() || null,
    })
    .returning();

  return NextResponse.json({ review });
}
