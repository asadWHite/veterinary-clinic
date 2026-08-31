import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { doctors as doctorsTable } from "@/db/schema";
import { BookingShell } from "@/components/booking/BookingShell";
import { getDoctorsWithAvailability, getPetsForUser, getServices } from "@/lib/clinic";
import { getSessionUser } from "@/lib/auth";
import { getI18n } from "@/i18n/server";
import { pickL } from "@/i18n/localized";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a visit",
  description:
    "Start with your companion, tell us what you have noticed, and we will recommend the right kind of visit — then you choose the clinician and time.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ doctor?: string }>;
}) {
  const params = await searchParams;
  const [{ locale }, user, doctors, services] = await Promise.all([
    getI18n(),
    getSessionUser(),
    getDoctorsWithAvailability(30),
    getServices(),
  ]);

  const pets = user ? await getPetsForUser(user.id) : [];

  let initialDoctorId: string | null = null;
  if (params.doctor) {
    const [match] = await db
      .select({ id: doctorsTable.id })
      .from(doctorsTable)
      .where(eq(doctorsTable.slug, params.doctor))
      .limit(1);
    initialDoctorId = match?.id ?? null;
  }

  return (
    <BookingShell
      doctors={doctors}
      user={user}
      initialDoctorId={initialDoctorId}
      pets={pets.map((p) => ({
        id: p.id,
        name: p.name,
        species: p.species,
        breed: p.breed,
        ageStage: p.ageStage,
        photoAssetId: p.photoAssetId,
      }))}
      services={services.map((s) => ({
        slug: s.slug,
        name: pickL(s.name, locale),
        durationMinutes: s.durationMinutes,
        summary: pickL(s.summary, locale),
      }))}
    />
  );
}
