"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  appointments,
  availability,
  blockedSlots,
  clinicSettings,
  doctors,
  journalPosts,
  reviews,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { timeToMinutes } from "@/lib/format";
import type { LocalizedText } from "@/db/schema";

async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || user.role === "user") throw new Error("forbidden");
  return user;
}

function revalidateAdmin() {
  for (const locale of ["uz", "ru", "en"]) {
    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/appointments`);
    revalidatePath(`/${locale}/admin/schedule`);
    revalidatePath(`/${locale}/admin/reviews`);
    revalidatePath(`/${locale}/admin/journal`);
    revalidatePath(`/${locale}/admin/settings`);
    revalidatePath(`/${locale}`);
  }
}

export async function updateAppointmentAction(formData: FormData): Promise<void> {
  const user = await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  if (id <= 0) return;
  const status = String(formData.get("status") ?? "");
  const urgency = String(formData.get("urgency") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (user.role === "doctor") {
    const rows = await db
      .select({ doctorId: appointments.doctorId })
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);
    if (rows[0]?.doctorId !== user.doctorId) return;
  }

  const validStatuses = ["pending", "confirmed", "completed", "cancelled", "no_show"] as const;
  const validUrgencies = ["routine", "soon", "urgent"] as const;
  const nextStatus = validStatuses.find((value) => value === status);
  const nextUrgency = validUrgencies.find((value) => value === urgency);

  await db
    .update(appointments)
    .set({
      ...(nextStatus ? { status: nextStatus } : {}),
      ...(nextUrgency ? { urgency: nextUrgency } : {}),
      notes: notes || null,
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, id));
  revalidateAdmin();
}

export async function moderateReviewAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  const status = String(formData.get("status") ?? "");
  if (id <= 0 || !["approved", "rejected", "pending"].includes(status)) return;
  await db
    .update(reviews)
    .set({ status: status as "approved" | "rejected" | "pending", moderatedAt: new Date() })
    .where(eq(reviews.id, id));
  revalidateAdmin();
}

export async function saveAvailabilityRuleAction(formData: FormData): Promise<void> {
  await requireStaff();
  const doctorId = Number(formData.get("doctorId") ?? 0);
  const weekday = Number(formData.get("weekday") ?? 0);
  const kind = String(formData.get("kind") ?? "work");
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  if (doctorId <= 0 || weekday < 0 || weekday > 6 || !start || !end) return;
  const startMinute = timeToMinutes(start);
  const endMinute = timeToMinutes(end);
  if (endMinute <= startMinute) return;
  await db.insert(availability).values({
    doctorId,
    weekday,
    kind: kind === "break" ? "break" : "work",
    startMinute,
    endMinute,
    isActive: true,
  });
  revalidateAdmin();
}

export async function deleteAvailabilityRuleAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  if (id <= 0) return;
  await db.delete(availability).where(eq(availability.id, id));
  revalidateAdmin();
}

export async function blockPeriodAction(formData: FormData): Promise<void> {
  await requireStaff();
  const doctorId = Number(formData.get("doctorId") ?? 0);
  const day = String(formData.get("day") ?? "");
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (doctorId <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !start || !end) return;
  const startMinute = timeToMinutes(start);
  const endMinute = timeToMinutes(end);
  if (endMinute <= startMinute) return;
  await db.insert(blockedSlots).values({ doctorId, day, startMinute, endMinute, reason: reason || null });
  revalidateAdmin();
}

export async function unblockPeriodAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  if (id <= 0) return;
  await db.delete(blockedSlots).where(eq(blockedSlots.id, id));
  revalidateAdmin();
}

function localized(
  formData: FormData,
  key: string,
  fallback: LocalizedText | null = null,
): LocalizedText {
  const uz = String(formData.get(`${key}Uz`) ?? fallback?.uz ?? "").trim();
  const ru = String(formData.get(`${key}Ru`) ?? fallback?.ru ?? "").trim();
  const en = String(formData.get(`${key}En`) ?? fallback?.en ?? "").trim();
  return { uz, ru, en };
}

export async function saveJournalPostAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  const slug = String(formData.get("slug") ?? "").trim();
  const categoryKey = String(formData.get("categoryKey") ?? "prevention").trim();
  const coverUrl = String(formData.get("coverUrl") ?? "").trim();
  const readingMinutes = Number(formData.get("readingMinutes") ?? 0);
  const isPublished = formData.get("isPublished") === "on";
  if (!slug) return;

  const title = localized(formData, "title");
  const excerpt = localized(formData, "excerpt");
  const body = localized(formData, "body");
  if (!title.uz && !title.ru && !title.en) return;

  if (id > 0) {
    await db
      .update(journalPosts)
      .set({ slug, title, excerpt, body, categoryKey, coverUrl: coverUrl || null, readingMinutes: readingMinutes || null, isPublished })
      .where(eq(journalPosts.id, id));
  } else {
    await db.insert(journalPosts).values({
      slug,
      title,
      excerpt,
      body,
      categoryKey,
      coverUrl: coverUrl || null,
      readingMinutes: readingMinutes || null,
      isPublished,
    });
  }
  revalidateAdmin();
}

export async function deleteJournalPostAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  if (id <= 0) return;
  await db.delete(journalPosts).where(eq(journalPosts.id, id));
  revalidateAdmin();
}

export async function saveClinicSettingsAction(formData: FormData): Promise<void> {
  await requireStaff();
  const entries: Array<{ key: string; value: LocalizedText | string }> = [
    { key: "clinicName", value: localized(formData, "clinicName") },
    { key: "phone", value: String(formData.get("phone") ?? "").trim() },
    { key: "phone2", value: String(formData.get("phone2") ?? "").trim() },
    { key: "email", value: String(formData.get("email") ?? "").trim() },
    { key: "address", value: localized(formData, "address") },
    { key: "hours", value: localized(formData, "hours") },
    { key: "emergencyPhone", value: String(formData.get("emergencyPhone") ?? "").trim() },
    { key: "instagram", value: String(formData.get("instagram") ?? "").trim() },
    { key: "lastAppointment", value: String(formData.get("lastAppointment") ?? "").trim() },
    { key: "timezone", value: String(formData.get("timezone") ?? "").trim() },
  ];

  for (const entry of entries) {
    await db
      .insert(clinicSettings)
      .values({ key: entry.key, value: entry.value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: clinicSettings.key,
        set: { value: entry.value, updatedAt: new Date() },
      });
  }
  revalidateAdmin();
}

export async function publishDoctorAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = Number(formData.get("doctorId") ?? 0);
  const isPublished = formData.get("isPublished") === "on";
  if (id <= 0) return;
  await db
    .update(doctors)
    .set({ isPublished })
    .where(and(eq(doctors.id, id)));
  revalidateAdmin();
}
