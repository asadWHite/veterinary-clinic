import Link from "next/link";
import { EmptyState, StatusPill } from "@/components/ui/Bits";
import { getAdminAppointments, getStatusCounts } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { formatDateLong, minutesToTime, nowInZone } from "@/lib/format";
import { getClinicSettings } from "@/lib/settings";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t } = createTranslator(locale);
  const user = await getCurrentUser();
  if (!user || user.role === "user") return null;

  const settings = await getClinicSettings();
  const today = nowInZone(settings.timezone).day;
  const scopeDoctorId = user.role === "doctor" ? (user.doctorId ?? undefined) : undefined;

  const [appointments, counts] = await Promise.all([
    getAdminAppointments({ scopeDoctorId, limit: 60 }, locale),
    getStatusCounts(scopeDoctorId ?? undefined),
  ]);

  const todays = appointments.filter((appointment) => appointment.day === today);
  const upcoming = appointments
    .filter((appointment) => appointment.day > today && appointment.status !== "cancelled")
    .slice(0, 8);
  const urgent = appointments.filter(
    (appointment) => appointment.urgency === "urgent" && appointment.status !== "cancelled",
  );

  const stats = [
    { key: "pending", label: t("statuses.pending") },
    { key: "confirmed", label: t("statuses.confirmed") },
    { key: "completed", label: t("statuses.completed") },
    { key: "cancelled", label: t("statuses.cancelled") },
    { key: "no_show", label: t("statuses.no_show") },
  ];

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("admin.title")}</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("admin.nav.dashboard")}</h1>
        <p className="max-w-xl text-[0.95rem] leading-relaxed text-ink-2">{t("admin.lead")}</p>
      </header>

      <section className="grid grid-cols-2 gap-6 border-y border-line py-6 sm:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.key} className="flex flex-col gap-1">
            <span className="label-eyebrow">{stat.label}</span>
            <span className="font-serif text-3xl text-ink">{counts[stat.key] ?? 0}</span>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <span className="label-eyebrow">{t("admin.dashboard.today")}</span>
          <span className="text-xs text-ink-2">{formatDateLong(today, locale)}</span>
        </div>
        {todays.length === 0 ? (
          <EmptyState title={t("admin.dashboard.emptyToday")} />
        ) : (
          <ul className="flex flex-col">
            {todays.map((appointment) => (
              <li
                key={appointment.id}
                className="flex flex-col gap-2 border-t border-line py-4 last:border-b sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <Link
                    href={`/${locale}/admin/appointments/${appointment.id}`}
                    className="link-underline text-base text-ink"
                  >
                    {minutesToTime(appointment.startMinute)} · {appointment.clientName}
                  </Link>
                  <span className="text-xs text-ink-2">
                    {appointment.serviceTitle} · {appointment.doctorName} ·{" "}
                    {appointment.petName ?? t("common.guest")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {appointment.urgency !== "routine" && (
                    <StatusPill status={appointment.urgency} label={t(`urgency.${appointment.urgency}`)} />
                  )}
                  <StatusPill status={appointment.status} label={t(`statuses.${appointment.status}`)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <span className="label-eyebrow">{t("admin.dashboard.upcoming")}</span>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-2">{t("admin.dashboard.noUpcoming")}</p>
          ) : (
            <ul className="flex flex-col">
              {upcoming.map((appointment) => (
                <li key={appointment.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <Link
                    href={`/${locale}/admin/appointments/${appointment.id}`}
                    className="link-underline text-sm text-ink"
                  >
                    {formatDateLong(appointment.day, locale)} · {minutesToTime(appointment.startMinute)}
                  </Link>
                  <span className="text-xs text-ink-2">{appointment.clientName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <span className="label-eyebrow">{t("admin.dashboard.urgent")}</span>
          {urgent.length === 0 ? (
            <p className="text-sm text-ink-2">{t("admin.dashboard.noUpcoming")}</p>
          ) : (
            <ul className="flex flex-col">
              {urgent.map((appointment) => (
                <li key={appointment.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <Link
                    href={`/${locale}/admin/appointments/${appointment.id}`}
                    className="link-underline text-sm text-clay"
                  >
                    {appointment.publicId} · {appointment.clientName}
                  </Link>
                  <span className="text-xs text-ink-2">{formatDateLong(appointment.day, locale)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
