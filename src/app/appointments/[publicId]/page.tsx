import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, safeQuery } from "@/db";
import { appointments, doctors, services } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { assetById, speciesMeta, type SpeciesKey } from "@/data/animals";
import { durationLabel, longDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Appointment" };

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const user = await getSessionUser();

  const fetchAppointment = () =>
    db
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
        ownerName: appointments.ownerName,
        ownerPhone: appointments.ownerPhone,
        notes: appointments.notes,
        doctorName: doctors.name,
        doctorSpecialization: doctors.specialization,
        serviceName: services.name,
      })
      .from(appointments)
      .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
      .innerJoin(services, eq(services.id, appointments.serviceId))
      .where(eq(appointments.publicId, publicId))
      .limit(1);

  const rows = await safeQuery(fetchAppointment, [], "appointment");
  const row = rows[0];
  if (!row) notFound();

  // Private data stays private: signed-in owners only see their own visits.
  const ownerRows = await safeQuery(
    () =>
      db
        .select({ userId: appointments.userId })
        .from(appointments)
        .where(eq(appointments.id, row.id))
        .limit(1),
    [],
    "appointmentOwner",
  );
  const owner = ownerRows[0];
  if (owner?.userId && owner.userId !== user?.id) notFound();

  const species = (row.species as SpeciesKey) ?? "dog";
  const asset = assetById(speciesMeta[species].assetId);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-[var(--line)]">
        <div className="shell flex h-16 items-center justify-between gap-6">
          <Link href="/" className="label link-underline text-ink/55 hover:text-ink">
            ← Back to site
          </Link>
          <p className="display d5 uppercase">Appointment</p>
          <span className="label hidden text-ink/35 sm:block">[CLINIC NAME]</span>
        </div>
      </header>

      <div className="shell grid grid-cols-1 gap-10 py-12 lg:grid-cols-12 lg:py-16">
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
          <p className="label text-forest">{row.status}</p>
          <h1 className="display d2 mt-4 uppercase">{row.petName}</h1>

          <dl className="mt-8 border-t border-[var(--line)]">
            {[
              { l: "Care", v: row.serviceName },
              { l: "Clinician", v: row.doctorName },
              { l: "Specialization", v: row.doctorSpecialization },
              { l: "Date", v: longDate(row.date) },
              { l: "Time", v: `${row.startTime} — ${row.endTime}` },
              { l: "Duration", v: durationLabel(row.durationMinutes) },
              { l: "Appointment ID", v: row.publicId },
            ].map((item) => (
              <div
                key={item.l}
                className="flex items-baseline justify-between gap-6 border-b border-[var(--line)] py-4"
              >
                <dt className="label text-ink/40">{item.l}</dt>
                <dd className="display d5 uppercase">{item.v}</dd>
              </div>
            ))}
          </dl>

          {row.notes ? (
            <div className="mt-8 border border-[var(--line)] p-5">
              <p className="label text-ink/40">Notes for the clinician</p>
              <p className="body-lg mt-3">{row.notes}</p>
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/booking"
              className="label arrow-forward flex items-center gap-3 bg-ink px-8 py-5 text-white"
            >
              Book another visit
              <span className="arrow">→</span>
            </Link>
            <Link href="/account/appointments" className="label px-2 py-5 text-ink/55 hover:text-ink">
              All appointments
            </Link>
          </div>

          <p className="label mt-10 leading-[1.9] text-ink/35">
            Need to change or cancel? Call the clinic and quote the appointment ID.
          </p>
        </div>
      </div>
    </div>
  );
}
