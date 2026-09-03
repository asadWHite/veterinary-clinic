import Link from "next/link";
import { EmptyState, StatusPill } from "@/components/ui/Bits";
import { getAdminAppointments, getDoctors, getServices } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { formatDateShort, minutesToTime } from "@/lib/format";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";
import type { AppointmentStatus, Urgency } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t } = createTranslator(locale);
  const query = await searchParams;
  const user = await getCurrentUser();
  if (!user || user.role === "user") return null;

  const text = (key: string) => (typeof query[key] === "string" ? (query[key] as string) : "");
  const number = (key: string) => {
    const value = Number(query[key] ?? 0);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  };

  const filters = {
    search: text("q") || undefined,
    dayFrom: text("from") || undefined,
    dayTo: text("to") || undefined,
    doctorId: number("doctor"),
    serviceId: number("service"),
    status: (text("status") || undefined) as AppointmentStatus | undefined,
    urgency: (text("urgency") || undefined) as Urgency | undefined,
    scopeDoctorId: user.role === "doctor" ? user.doctorId ?? undefined : undefined,
  };

  const [appointments, doctors, services] = await Promise.all([
    getAdminAppointments(filters, locale),
    getDoctors(locale),
    getServices(locale),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("admin.title")}</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("admin.appointments.title")}</h1>
      </header>

      <form
        method="get"
        className="grid grid-cols-1 gap-5 border border-line bg-canvas-2/40 p-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <label className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3">
          <span className="label-eyebrow">{t("admin.appointments.search")}</span>
          <input
            name="q"
            defaultValue={filters.search ?? ""}
            placeholder={t("admin.appointments.searchPlaceholder")}
            className="field-input"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow">{t("admin.appointments.from")}</span>
          <input type="date" name="from" defaultValue={filters.dayFrom ?? ""} className="field-input" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow">{t("admin.appointments.to")}</span>
          <input type="date" name="to" defaultValue={filters.dayTo ?? ""} className="field-input" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow">{t("booking.steps.doctor")}</span>
          <select name="doctor" defaultValue={filters.doctorId ? String(filters.doctorId) : ""} className="field-input">
            <option value="">{t("admin.appointments.allDoctors")}</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow">{t("booking.steps.service")}</span>
          <select name="service" defaultValue={filters.serviceId ? String(filters.serviceId) : ""} className="field-input">
            <option value="">{t("admin.appointments.allServices")}</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow">{t("statuses.pending")}</span>
          <select name="status" defaultValue={filters.status ?? ""} className="field-input">
            <option value="">{t("admin.appointments.allStatuses")}</option>
            {["pending", "confirmed", "completed", "cancelled", "no_show"].map((status) => (
              <option key={status} value={status}>
                {t(`statuses.${status}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow">{t("booking.recommendation.urgency")}</span>
          <select name="urgency" defaultValue={filters.urgency ?? ""} className="field-input">
            <option value="">{t("admin.appointments.allUrgency")}</option>
            {["routine", "soon", "urgent"].map((urgency) => (
              <option key={urgency} value={urgency}>
                {t(`urgency.${urgency}`)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3">
          <button type="submit" className="btn btn-primary !py-3">
            {t("admin.appointments.apply")}
          </button>
          <Link href={`/${locale}/admin/appointments`} className="btn btn-quiet !py-3">
            {t("admin.appointments.reset")}
          </Link>
        </div>
      </form>

      {appointments.length === 0 ? (
        <EmptyState title={t("admin.appointments.empty")} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {[t("booking.summary.date"), t("booking.summary.client"), t("booking.summary.pet"), t("booking.steps.service"), t("booking.steps.doctor"), t("admin.appointments.urgency"), ""].map(
                  (heading, index) => (
                    <th key={index} className="py-3 pr-4 text-[0.62rem] tracking-[0.16em] text-ink-2 uppercase">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-line align-top">
                  <td className="py-4 pr-4 whitespace-nowrap">
                    <span className="block text-ink">{formatDateShort(appointment.day, locale)}</span>
                    <span className="text-xs text-ink-2">{minutesToTime(appointment.startMinute)}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="block text-ink">{appointment.clientName}</span>
                    <span className="text-xs text-ink-2">{appointment.clientPhone}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="block text-ink">{appointment.petName ?? t("common.guest")}</span>
                    <span className="text-xs text-ink-2">{t(`species.${appointment.species}`)}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="block text-ink">{appointment.serviceTitle}</span>
                    <span className="text-xs text-ink-2">{appointment.publicId}</span>
                  </td>
                  <td className="py-4 pr-4 text-ink-2">{appointment.doctorName}</td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-col gap-2">
                      <StatusPill status={appointment.status} label={t(`statuses.${appointment.status}`)} />
                      {appointment.urgency !== "routine" && (
                        <StatusPill status={appointment.urgency} label={t(`urgency.${appointment.urgency}`)} />
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <Link
                      href={`/${locale}/admin/appointments/${appointment.id}`}
                      className="link-underline text-xs text-forest uppercase"
                    >
                      {t("account.appointments.details")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
