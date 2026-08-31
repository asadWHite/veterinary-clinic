import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, doctors, services } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { longDate, durationLabel } from "@/lib/format";
import { ReviewForm } from "@/components/account/ReviewForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Appointments" };

export default async function AccountAppointmentsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const rows = await db
    .select({
      id: appointments.id,
      publicId: appointments.publicId,
      date: appointments.date,
      startTime: appointments.startTime,
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

  return (
    <div className="px-[var(--gutter)] py-10 lg:py-14">
      <p className="label text-ink/40">Appointments</p>
      <h1 className="display d2 mt-5 uppercase">Your visits.</h1>

      {rows.length === 0 ? (
        <div className="mt-10 border border-[var(--line)] p-10 text-center">
          <p className="display d5 uppercase">Nothing booked yet</p>
          <p className="body-lg mt-3">Start with who your companion is — we will take it from there.</p>
          <Link
            href="/booking"
            className="label arrow-forward mt-6 inline-flex items-center gap-3 bg-ink px-6 py-4 text-white"
          >
            Book a visit
            <span className="arrow">→</span>
          </Link>
        </div>
      ) : (
        <ul className="mt-10 border-t border-[var(--line)]">
          {rows.map((row) => (
            <li key={row.id} className="border-b border-[var(--line)] py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="label text-ink/40">{row.serviceName}</p>
                  <p className="display d4 mt-2 uppercase">{row.petName}</p>
                </div>
                <div className="text-right">
                  <p className="mono-num text-sm font-bold">{longDate(row.date)}</p>
                  <p className="label mt-1 text-ink/45">
                    {row.startTime} · {durationLabel(row.durationMinutes)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="label border border-[var(--line)] px-3 py-2 text-ink/55">
                  {row.status}
                </span>
                <span className="label text-ink/45">{row.doctorName}</span>
                <Link
                  href={`/appointments/${row.publicId}`}
                  className="label link-underline text-forest"
                >
                  View
                </Link>
                {row.status === "completed" ? <ReviewForm appointmentId={row.id} /> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
