import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, doctors, pets as petsTable, services } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { assetById, speciesInfo, type SpeciesKey } from "@/data/animals";
import { ageLabelL, longDateL, durationLabelL } from "@/lib/format";
import { getI18n } from "@/i18n/server";
import { pickL } from "@/i18n/localized";

export const dynamic = "force-dynamic";

export default async function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ t, locale }, user] = await Promise.all([getI18n(), getSessionUser()]);
  if (!user) return null;

  const [pet] = await db
    .select()
    .from(petsTable)
    .where(and(eq(petsTable.id, id), eq(petsTable.userId, user.id)))
    .limit(1);
  if (!pet) notFound();

  const visits = await db
    .select({
      id: appointments.id,
      publicId: appointments.publicId,
      date: appointments.date,
      startTime: appointments.startTime,
      durationMinutes: appointments.durationMinutes,
      status: appointments.status,
      doctorName: doctors.name,
      serviceName: services.name,
    })
    .from(appointments)
    .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .where(eq(appointments.petId, pet.id))
    .orderBy(desc(appointments.date));

  const species = (pet.species as SpeciesKey) ?? "dog";
  const asset = assetById(pet.photoAssetId ?? speciesInfo(species, locale).assetId);

  return (
    <div className="px-[var(--gutter)] py-10 lg:py-14">
      <Link href="/pets" className="label link-underline text-ink/45 hover:text-ink">
        {t("pets.allCompanions")}
      </Link>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Image
            src={asset.src}
            alt={asset.alt}
            width={1024}
            height={1024}
            sizes="(max-width: 1024px) 90vw, 40vw"
            className="h-auto w-full select-none"
            style={{ mixBlendMode: "multiply" }}
          />
        </div>

        <div className="lg:col-span-7">
          <p className="label text-ink/40">{t("pets.profile")}</p>
          <h1 className="display d2 mt-4 uppercase">{pet.name}</h1>

          <dl className="mt-8 border-t border-[var(--line)]">
            {[
              { l: t("pets.species"), v: t(`species.${species}`) },
              { l: t("pets.breed"), v: pet.breed ?? t("notAvailable") },
              { l: t("pets.lifeStage"), v: pet.ageStage ? t(`ageStage.${pet.ageStage}`) : t("notAvailable") },
              { l: t("pets.birthYear"), v: pet.birthYear ? String(pet.birthYear) : t("notAvailable") },
              { l: t("pets.weight"), v: pet.weightKg ? `${pet.weightKg} ${t("pets.weightUnit")}` : t("notAvailable") },
              { l: t("pets.age"), v: ageLabelL(pet.birthYear, locale) },
            ].map((row) => (
              <div
                key={row.l}
                className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-3"
              >
                <dt className="label text-ink/40">{row.l}</dt>
                <dd className="text-sm font-semibold capitalize">{row.v}</dd>
              </div>
            ))}
          </dl>

          <Link
            href="/booking"
            className="label arrow-forward mt-8 inline-flex items-center gap-3 bg-ink px-6 py-4 text-white"
          >
            {t("pets.bookFor", { name: pet.name })}
            <span className="arrow">→</span>
          </Link>
        </div>
      </div>

      <section className="mt-16 grid grid-cols-1 gap-10 border-t border-[var(--line)] pt-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label text-ink/40">{t("pets.appointments")}</p>
          {visits.length === 0 ? (
            <p className="body-lg mt-4">{t("pets.noVisits")}</p>
          ) : (
            <ul className="mt-6 border-t border-[var(--line)]">
              {visits.map((visit) => (
                <li key={visit.id} className="border-b border-[var(--line)] py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <p className="label text-ink/40">{visit.serviceName}</p>
                      <p className="display d5 mt-1 uppercase">{visit.doctorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="mono-num text-sm font-bold">{longDateL(visit.date, locale)}</p>
                      <p className="label mt-1 text-ink/45">
                        {visit.startTime} · {durationLabelL(visit.durationMinutes, locale)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-5">
          <p className="label text-ink/40">{t("pets.medicalHistory")}</p>
          <p className="body-lg mt-4">{t("pets.medicalBody")}</p>
          <p className="label mt-8 text-ink/40">{t("pets.vaccinations")}</p>
          <p className="body-lg mt-4">{t("pets.vaccinationsBody")}</p>
        </div>
      </section>
    </div>
  );
}
