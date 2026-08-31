import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, doctors, reviews } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { monthDay } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reviews" };

export default async function AccountReviewsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      body: reviews.body,
      createdAt: reviews.createdAt,
      doctorName: doctors.name,
      date: appointments.date,
      petName: appointments.petName,
    })
    .from(reviews)
    .innerJoin(doctors, eq(doctors.id, reviews.doctorId))
    .innerJoin(appointments, eq(appointments.id, reviews.appointmentId))
    .where(eq(reviews.userId, user.id))
    .orderBy(desc(reviews.createdAt));

  return (
    <div className="px-[var(--gutter)] py-10 lg:py-14">
      <p className="label text-ink/40">Reviews</p>
      <h1 className="display d2 mt-5 uppercase">{"What you"}<br />{"told us."}</h1>
      <p className="body-lg mt-5 max-w-lg">
        Only visits you have reviewed. We publish nothing without you writing it.
      </p>

      {rows.length === 0 ? (
        <div className="mt-10 border border-[var(--line)] p-10">
          <p className="display d5 uppercase">No reviews yet</p>
          <p className="body-lg mt-3">
            After a completed visit you can leave a review from the appointments list.
          </p>
        </div>
      ) : (
        <ul className="mt-10 border-t border-[var(--line)]">
          {rows.map((row) => (
            <li key={row.id} className="border-b border-[var(--line)] py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="label text-forest">{"★".repeat(row.rating)}</p>
                  <p className="display d5 mt-2 uppercase">{row.doctorName}</p>
                </div>
                <p className="label text-ink/40">
                  {row.petName} · {monthDay(row.date)}
                </p>
              </div>
              {row.body ? <p className="body-lg mt-4 max-w-2xl">{row.body}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
