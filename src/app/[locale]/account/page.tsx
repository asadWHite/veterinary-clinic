import Link from "next/link";
import { EmptyState, StatusPill, StarRating } from "@/components/ui/Bits";
import { cancelAppointmentAction } from "@/features/account/actions";
import {
  getFavoriteDoctorIds,
  getDoctors,
  getPets,
  getUserAppointments,
  getUserReviews,
  getVaccinationReminders,
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { formatDateLong, minutesToTime, nowInZone } from "@/lib/format";
import { getClinicSettings } from "@/lib/settings";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AccountOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t } = createTranslator(locale);
  const user = await getCurrentUser();
  if (!user) return null;

  const [pets, appointments, reviews, reminders, doctors] = await Promise.all([
    getPets(user.id),
    getUserAppointments(user.id, locale),
    getUserReviews(user.id, locale),
    getVaccinationReminders(user.id, locale),
    getDoctors(locale),
  ]);
  const favoriteIds = await getFavoriteDoctorIds(user.id);
  const settings = await getClinicSettings();
  const today = nowInZone(settings.timezone).day;

  const upcoming = appointments.filter(
    (appointment) => appointment.day >= today && appointment.status !== "cancelled",
  );
  const past = appointments.filter(
    (appointment) => appointment.day < today || appointment.status === "completed",
  );
  const favoriteDoctors = doctors.filter((doctor) => favoriteIds.includes(doctor.id));

  return (
    <div className="flex flex-col gap-14">
      <header className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("account.title")}</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("account.nav.overview")}</h1>
      </header>

      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <span className="label-eyebrow">{t("account.overview.next")}</span>
          <Link href={`/${locale}/book`} className="link-underline text-[0.72rem] tracking-[0.14em] text-forest uppercase">
            {t("account.overview.bookNow")}
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState title={t("account.overview.noUpcoming")} hint={t("account.appointments.emptyHint")} />
        ) : (
          <ul className="flex flex-col">
            {upcoming.slice(0, 3).map((appointment) => (
              <li
                key={appointment.id}
                className="flex flex-col gap-3 border-t border-line py-5 last:border-b sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-lg tracking-tight text-ink">{appointment.serviceTitle}</span>
                  <span className="text-sm text-ink-2">
                    {appointment.doctorName} · {formatDateLong(appointment.day, locale)} ·{" "}
                    {minutesToTime(appointment.startMinute)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={appointment.status} label={t(`statuses.${appointment.status}`)} />
                  <form action={cancelAppointmentAction}>
                    <input type="hidden" name="appointmentId" value={appointment.id} />
                    <button type="submit" className="link-underline text-xs text-ink-2 uppercase">
                      {t("account.appointments.cancel")}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="label-eyebrow">{t("account.overview.pets")}</span>
          {pets.length === 0 ? (
            <EmptyState
              title={t("account.pets.empty")}
              hint={t("account.pets.emptyHint")}
              action={
                <Link href={`/${locale}/account/pets`} className="btn btn-ghost">
                  {t("account.pets.add")}
                </Link>
              }
            />
          ) : (
            <ul className="flex flex-col">
              {pets.map((pet) => (
                <li key={pet.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <span className="text-base text-ink">{pet.name}</span>
                  <span className="text-xs text-ink-2">
                    {t(`species.${pet.species}`)}
                    {pet.breed ? ` · ${pet.breed}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <span className="label-eyebrow">{t("account.overview.reminders")}</span>
          {reminders.length === 0 ? (
            <p className="text-sm text-ink-2">{t("account.overview.noReminders")}</p>
          ) : (
            <ul className="flex flex-col">
              {reminders.map((reminder) => (
                <li key={reminder.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <span className="text-sm text-ink">{reminder.petName}</span>
                  <span className="text-xs text-ink-2">{reminder.nextDueAt}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <span className="label-eyebrow">{t("account.overview.favorites")}</span>
          {favoriteDoctors.length === 0 ? (
            <p className="text-sm text-ink-2">{t("account.favorites.empty")}</p>
          ) : (
            <ul className="flex flex-col">
              {favoriteDoctors.map((doctor) => (
                <li key={doctor.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <Link href={`/${locale}/doctors/${doctor.slug}`} className="link-underline text-sm text-ink">
                    {doctor.name}
                  </Link>
                  <span className="text-xs text-ink-2">{doctor.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <span className="label-eyebrow">{t("account.overview.reviews")}</span>
          {reviews.length === 0 ? (
            <p className="text-sm text-ink-2">{t("account.reviews.empty")}</p>
          ) : (
            <ul className="flex flex-col">
              {reviews.slice(0, 3).map((review) => (
                <li key={review.id} className="flex flex-col gap-2 border-b border-line py-3">
                  <div className="flex items-center justify-between gap-3">
                    <StarRating value={review.rating} />
                    <StatusPill status={review.status} label={t(`statuses.${review.status}`)} />
                  </div>
                  <p className="text-sm leading-relaxed text-ink-2">{review.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <span className="label-eyebrow">{t("account.overview.past")}</span>
        {past.length === 0 ? (
          <p className="text-sm text-ink-2">{t("account.appointments.empty")}</p>
        ) : (
          <ul className="flex flex-col">
            {past.slice(0, 5).map((appointment) => (
              <li key={appointment.id} className="flex flex-col gap-1 border-t border-line py-4 last:border-b sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-ink">
                  {formatDateLong(appointment.day, locale)} · {appointment.serviceTitle}
                </span>
                <StatusPill status={appointment.status} label={t(`statuses.${appointment.status}`)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
