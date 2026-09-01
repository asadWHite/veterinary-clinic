import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db, checkDatabase } from "@/db";
import { doctors as doctorsTable } from "@/db/schema";
import { BookingShell } from "@/components/booking/BookingShell";
import { DbNotice } from "@/components/ui/DbNotice";
import {
  getDoctorsWithAvailabilitySafe,
  getPetsForUser,
  getServices,
} from "@/lib/clinic";
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
  const [{ locale, t }, params, user, dbStatus] = await Promise.all([
    getI18n(),
    searchParams,
    getSessionUser(),
    checkDatabase(),
  ]);

  // No database (for example a fresh deploy without DATABASE_URL):
  // render a clear, translated screen instead of a server error.
  if (!dbStatus.ok) {
    return (
      <div className="booking-shell min-h-screen bg-canvas">
        <div className="border-b border-[var(--line)]">
          <div className="shell flex h-16 items-center justify-between gap-6">
            <a href="/" className="label link-underline text-ink/55 hover:text-ink">
              ← {t("common.backToSite")}
            </a>
            <p className="display d5 uppercase">{t("booking.title")}</p>
          </div>
        </div>
        <DbNotice />
        <div className="shell py-20">
          <h1 className="display d2 uppercase">{t("booking.title")}</h1>
          <p className="body-lg mt-6 max-w-xl">{t("booking.errors.databaseDown")}</p>
          <a href="/api/health" className="label link-underline mt-8 inline-block text-forest">
            /api/health
          </a>
        </div>
      </div>
    );
  }

  const [{ doctors, scheduleUnavailable }, services, pets] = await Promise.all([
    getDoctorsWithAvailabilitySafe(30),
    getServices(),
    user ? getPetsForUser(user.id) : Promise.resolve([]),
  ]);

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
      scheduleUnavailable={scheduleUnavailable}
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
