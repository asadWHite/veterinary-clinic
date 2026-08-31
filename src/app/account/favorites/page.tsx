import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { getDoctorsWithAvailability } from "@/lib/clinic";
import { DoctorPortrait } from "@/components/doctors/DoctorPortrait";
import { FavoriteToggle } from "@/components/doctors/FavoriteToggle";
import { shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Favorites" };

export default async function AccountFavoritesPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [saved, doctors] = await Promise.all([
    db.select({ doctorId: favorites.doctorId }).from(favorites).where(eq(favorites.userId, user.id)),
    getDoctorsWithAvailability(30),
  ]);
  const savedIds = new Set(saved.map((s) => s.doctorId));
  const list = doctors.filter((d) => savedIds.has(d.id));

  return (
    <div className="px-[var(--gutter)] py-10 lg:py-14">
      <p className="label text-ink/40">Favorites</p>
      <h1 className="display d2 mt-5 uppercase">Saved clinicians.</h1>

      {list.length === 0 ? (
        <div className="mt-10 border border-[var(--line)] p-10">
          <p className="display d5 uppercase">Nothing saved yet</p>
          <p className="body-lg mt-3">
            Save a clinician from the booking flow or the clinicians page to see their next
            availability here.
          </p>
          <Link href="/doctors" className="label arrow-forward mt-6 inline-flex items-center gap-3 text-forest">
            Browse clinicians
            <span className="arrow">→</span>
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((doctor) => (
            <li key={doctor.id}>
              <Link href={`/booking?doctor=${doctor.slug}`} className="group block">
                <DoctorPortrait
                  doctor={doctor}
                  className="aspect-[4/5] w-full transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="mt-4 border-t border-[var(--line)] pt-3">
                  <p className="display d5 uppercase">{doctor.name}</p>
                  <p className="mt-2 text-[0.8rem] text-ink/55">{doctor.specialization}</p>
                  <p className="label mt-3 text-forest">
                    Next {doctor.next ? `${doctor.next.time} · ${shortDate(doctor.next.date)}` : "—"}
                  </p>
                </div>
              </Link>
              <div className="mt-3">
                <FavoriteToggle doctorId={doctor.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
