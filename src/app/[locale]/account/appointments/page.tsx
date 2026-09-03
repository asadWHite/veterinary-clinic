import Link from "next/link";
import { EmptyState, StatusPill } from "@/components/ui/Bits";
import { cancelAppointmentAction } from "@/features/account/actions";
import { getUserAppointments } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { formatDateLong, minutesToTime, nowInZone } from "@/lib/format";
import { getClinicSettings } from "@/lib/settings";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AccountAppointmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t } = createTranslator(locale);
  const user = await getCurrentUser();
  if (!user) return null;

  const [appointments, settings] = await Promise.all([
    getUserAppointments(user.id, locale),
    getClinicSettings(),
  ]);
  const today = nowInZone(settings.timezone).day;
  const upcoming = appointments.filter(
    (appointment) => appointment.day >= today && appointment.status !== "cancelled",
  );
  const past = appointments.filter(
    (appointment) => appointment.day < today || appointment.status === "cancelled",
  );

  function Row({
    appointment,
    cancellable,
  }: {
    appointment: (typeof appointments)[number];
    cancellable: boolean;
  }) {
    return (
      <li className="flex flex-col gap-3 border-t border-line py-5 last:border-b sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-base tracking-tight text-ink">{appointment.serviceTitle}</span>
          <span className="text-sm text-ink-2">
            {appointment.doctorName} · {formatDateLong(appointment.day, locale)} ·{" "}
            {minutesToTime(appointment.startMinute)} · {appointment.durationMinutes} {t("common.minutes")}
          </span>
          <span className="text-xs text-ink-2">
            {t("account.appointments.code")}: {appointment.publicId}
            {appointment.petName ? ` · ${appointment.petName}` : ""}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={appointment.status} label={t(`statuses.${appointment.status}`)} />
          {appointment.urgency !== "routine" && (
            <StatusPill status={appointment.urgency} label={t(`urgency.${appointment.urgency}`)} />
          )}
          {cancellable && (
            <form action={cancelAppointmentAction}>
              <input type="hidden" name="appointmentId" value={appointment.id} />
              <button type="submit" className="link-underline text-xs text-ink-2 uppercase">
                {t("account.appointments.cancel")}
              </button>
            </form>
          )}
          {appointment.status === "completed" && (
            <Link
              href={`/${locale}/reviews`}
              className="link-underline text-xs text-forest uppercase"
            >
              {t("account.appointments.writeReview")}
            </Link>
          )}
        </div>
      </li>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("account.title")}</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("account.appointments.title")}</h1>
        <p className="max-w-xl text-[0.95rem] leading-relaxed text-ink-2">
          {t("account.appointments.lead")}
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <span className="label-eyebrow">{t("account.overview.next")}</span>
        {upcoming.length === 0 ? (
          <EmptyState
            title={t("account.appointments.empty")}
            hint={t("account.appointments.emptyHint")}
            action={
              <Link href={`/${locale}/book`} className="btn btn-ghost">
                {t("nav.book")}
              </Link>
            }
          />
        ) : (
          <ul className="flex flex-col">
            {upcoming.map((appointment) => (
              <Row key={appointment.id} appointment={appointment} cancellable />
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <span className="label-eyebrow">{t("account.overview.past")}</span>
        {past.length === 0 ? (
          <p className="text-sm text-ink-2">{t("account.appointments.empty")}</p>
        ) : (
          <ul className="flex flex-col">
            {past.map((appointment) => (
              <Row key={appointment.id} appointment={appointment} cancellable={false} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
