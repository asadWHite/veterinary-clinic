"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { appointments, favorites, pets, profiles, reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export type ActionState = {
  error?: string;
  ok?: boolean;
  message?: string;
};

export async function toggleFavoriteAction(doctorId: number): Promise<{ active: boolean }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");
  const existing = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.doctorId, doctorId)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(favorites).where(eq(favorites.id, existing[0].id));
    return { active: false };
  }
  await db.insert(favorites).values({ userId: user.id, doctorId });
  return { active: true };
}

export async function savePetAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "auth.errors.generic" };

  const id = Number(formData.get("id") ?? 0);
  const name = String(formData.get("name") ?? "").trim();
  const species = String(formData.get("species") ?? "dog") as "dog" | "cat" | "other";
  const breed = String(formData.get("breed") ?? "").trim();
  const sex = String(formData.get("sex") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const weight = Number(formData.get("weight") ?? 0);
  const notes = String(formData.get("notes") ?? "").trim();

  if (name.length < 1) return { error: "validation.required" };

  const values = {
    userId: user.id,
    name,
    species,
    breed: breed || null,
    sex: sex || null,
    birthDate: birthDate || null,
    weightGrams: weight > 0 ? Math.round(weight * 1000) : null,
    notes: notes || null,
    updatedAt: new Date(),
  };

  try {
    if (id > 0) {
      await db
        .update(pets)
        .set(values)
        .where(and(eq(pets.id, id), eq(pets.userId, user.id)));
    } else {
      await db.insert(pets).values(values);
    }
  } catch {
    return { error: "auth.errors.generic" };
  }
  revalidatePath("/uz/account/pets");
  revalidatePath("/ru/account/pets");
  revalidatePath("/en/account/pets");
  return { ok: true };
}

export async function deletePetAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const id = Number(formData.get("petId") ?? 0);
  if (id <= 0) return;
  await db.delete(pets).where(and(eq(pets.id, id), eq(pets.userId, user.id)));
  revalidatePath("/uz/account/pets");
  revalidatePath("/ru/account/pets");
  revalidatePath("/en/account/pets");
}

export async function cancelAppointmentAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const id = Number(formData.get("appointmentId") ?? 0);
  if (id <= 0) return;
  await db
    .update(appointments)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(appointments.id, id), eq(appointments.userId, user.id)));
  revalidatePath("/uz/account");
  revalidatePath("/ru/account");
  revalidatePath("/en/account");
}

export async function createReviewAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "reviewsPage.loginRequired" };

  const appointmentId = Number(formData.get("appointmentId") ?? 0);
  const rating = Number(formData.get("rating") ?? 0);
  const body = String(formData.get("body") ?? "").trim();

  if (appointmentId <= 0) return { error: "reviewsPage.notEligible" };
  if (rating < 1 || rating > 5) return { error: "reviewsPage.rating" };
  if (body.length < 10) return { error: "validation.tooShort" };

  const rows = await db
    .select({ id: appointments.id, doctorId: appointments.doctorId, status: appointments.status, userId: appointments.userId })
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .limit(1);
  const appointment = rows[0];
  if (!appointment || appointment.userId !== user.id) return { error: "reviewsPage.notEligible" };
  if (appointment.status !== "completed") return { error: "reviewsPage.notEligible" };

  const existing = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.appointmentId, appointmentId))
    .limit(1);
  if (existing.length > 0) return { error: "reviewsPage.notEligible" };

  await db.insert(reviews).values({
    appointmentId,
    userId: user.id,
    doctorId: appointment.doctorId,
    rating,
    body,
    status: "pending",
  });

  revalidatePath("/uz/reviews");
  revalidatePath("/ru/reviews");
  revalidatePath("/en/reviews");
  return { ok: true, message: "reviewsPage.thanks" };
}

export async function updateAccountLocaleAction(locale: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await db.update(profiles).set({ locale, updatedAt: new Date() }).where(eq(profiles.id, user.id));
}
