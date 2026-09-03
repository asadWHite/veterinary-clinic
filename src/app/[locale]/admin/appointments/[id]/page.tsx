import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/ui/Bits";
import { updateAppointmentAction } from "@/features/admin/actions";
import { getAppointmentDetail } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { getDayStructure } from "@/lib/booking/availability";
import { ageFromBirthDate, formatDateLong, lifeStageFromBirthDate, minutesToTime } from "@/lib/format";
import { QUESTIONS } from "@/lib/booking/questions";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t, tObj } = createTranslator(locale);
  const user = await getCurrentUser();
  if (!user || user.role === "user") return null;

  const appointmentId = Number(id);
  if (!Number.isFinite(appointmentId) || appointmentId <= 0) notFound();
  const detail = await getAppointmentDetail(appointmentId, locale);
  if (!detail) notFound();
  if (user.role === "doctor" && user.doctorId !== detail.appointment.doctorId) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-h2 text-ink">{t("admin.access.denied")}</h1>
        <p className="text-sm text-ink-2">{t("admin.access.doctorScope")}</p>
      </div>
    );
  }

  const { appointment, answers } = detail;
  const structure = await getDayStructure(appointment.day, [appointment.doctorId]);
  const plan = structure.doctors[0];

  function answerLabel(key: string, value: string): string {
    if (key === "main_concern") {
      const label = t(`concerns.${value}`);
      return label.startsWith("concerns.") ? value : label;
    }
    const dictionary = tObj(`answers.${key}`);
    return value
      .split(",")
      .filter(Boolean)
      .map((part) => dictionary[part] ?? part)
      .join(", ");
  }

  function questionLabel(key: string): string {
    const label = t(`questions.${key}`);
    return label.startsWith("questions.") ? key : label;
  }

  const clientRows = [
    { label: t("booking.confirmation.bookingId"), value: appointment.publicId },
    { label: t("admin.appointments.client"), value: appointment.clientName },
    { label: t("booking.client.phone"), value: appointment.clientPhone },
    { label: t("booking.client.email"), value: appointment.clientEmail ?? t("common.none") },
    { label: t("booking.summary.date"), value: formatDateLong(appointment.day, locale) },
    { label: t("booking.summary.time"), value: minutesToTime(appointment.startMinute) },
    { label: t("booking.summary.duration"), value: `${appointment.durationMinutes} ${t("common.minutesFull")}` },
    { label: t("booking.steps.doctor"), value: detail.doctorName },
    { label: t("booking.steps.service"), value: detail.serviceTitle },
  ];

  const petRows = [
    { label: t("booking.summary.pet"), value: appointment.petName ?? detail.pet?.name ?? t("common.guest") },
    { label: t("booking.animal.question"), value: t(`species.${appointment.species}`) },
    {
      label: t("booking.pet.breed"),
      value: appointment.petBreed ?? detail.pet?.breed ?? t("common.unknown"),
    },
    {
      label: t("account.pets.age"),
      value:
        detail.pet?.birthDate
          ? `${ageFromBirthDate(detail.pet.birthDate, locale) ?? "—"} · ${t(
              `lifeStages.${lifeStageFromBirthDate(detail.pet.birthDate)}`,
            )}`
          : t(`lifeStages.${appointment.lifeStage}`),
    },
    {
      label: t("booking.pet.weight"),
      value: detail.pet?.weightGrams ? `${detail.pet.weightGrams / 1000} kg` : t("common.unknown"),
    },
    { label: t("booking.reason.question"), value: t(`reasons.${appointment.reasonKey}`) },
    { label: t("booking.recommendation.urgency"), value: t(`urgency.${appointment.urgency}`) },
  ];

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <Link
          href={`/${locale}/admin/appointments`}
          className="link-underline text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase"
        >
          ← {t("admin.appointments.title")}
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-h2 font-normal tracking-tight text-ink">{appointment.publicId}</h1>
          <StatusPill status={appointment.status} label={t(`statuses.${appointment.status}`)} />
          <StatusPill status={appointment.urgency} label={t(`urgency.${appointment.urgency}`)} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <span className="label-eyebrow">{t("admin.appointments.client")}</span>
          <dl className="flex flex-col">
            {clientRows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-line py-3">
                <dt className="text-xs text-ink-2">{row.label}</dt>
                <dd className="text-right text-sm text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="flex flex-col gap-4">
          <span className="label-eyebrow">{t("admin.appointments.pet")}</span>
          <dl className="flex flex-col">
            {petRows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-line py-3">
                <dt className="text-xs text-ink-2">{row.label}</dt>
                <dd className="text-right text-sm text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className="flex flex-col gap-5 border-t border-line pt-10">
        <span className="label-eyebrow">{t("admin.appointments.toldUs")}</span>
        {answers.length === 0 ? (
          <p className="text-sm text-ink-2">{t("admin.appointments.noAnswers")}</p>
        ) : (
          <ol className="flex flex-col">
            {answers.map((answer, index) => (
              <li key={answer.id} className="flex flex-col gap-1 border-b border-line py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <span className="flex items-baseline gap-4">
                  <span className="section-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-sm text-ink">{questionLabel(answer.questionKey)}</span>
                </span>
                <span className="max-w-[60%] text-right text-sm text-ink-2">
                  {answer.isFreeText || !(answer.questionKey in QUESTIONS)
                    ? answer.answerValue || t("common.none")
                    : answerLabel(answer.questionKey, answer.answerValue)}
                </span>
              </li>
            ))}
          </ol>
        )}
        {appointment.notes && (
          <div className="flex flex-col gap-2 border-l-2 border-sage pl-4">
            <span className="label-eyebrow">{t("admin.appointments.notes")}</span>
            <p className="text-sm leading-relaxed text-ink-2">{appointment.notes}</p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-6 border-t border-line pt-10 lg:flex-row lg:items-start lg:gap-16">
        <form action={updateAppointmentAction} className="flex w-full max-w-md flex-col gap-5">
          <input type="hidden" name="id" value={appointment.id} />
          <span className="label-eyebrow">{t("admin.appointments.changeStatus")}</span>
          <label className="flex flex-col gap-2">
            <span className="label-eyebrow">{t("admin.appointments.changeStatus")}</span>
            <select name="status" defaultValue={appointment.status} className="field-input">
              {["pending", "confirmed", "completed", "cancelled", "no_show"].map((status) => (
                <option key={status} value={status}>
                  {t(`statuses.${status}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="label-eyebrow">{t("admin.appointments.urgency")}</span>
            <select name="urgency" defaultValue={appointment.urgency} className="field-input">
              {["routine", "soon", "urgent"].map((urgency) => (
                <option key={urgency} value={urgency}>
                  {t(`urgency.${urgency}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="label-eyebrow">{t("admin.appointments.internalNotes")}</span>
            <textarea name="notes" rows={3} defaultValue={appointment.notes ?? ""} className="field-input resize-none" />
          </label>
          <button type="submit" className="btn btn-primary self-start">
            {t("common.save")}
          </button>
        </form>

        <div className="flex flex-1 flex-col gap-4">
          <span className="label-eyebrow">{t("admin.appointments.calendar")}</span>
          <div className="flex flex-col gap-2 border border-line p-5">
            <span className="text-sm text-ink">{formatDateLong(appointment.day, locale)}</span>
            <div className="mt-2 flex flex-col gap-1.5">
              {plan?.work.map((interval, index) => (
                <span key={`work-${index}`} className="flex items-center gap-3 text-xs text-ink-2">
                  <span className="inline-block h-2.5 w-6 border border-forest" aria-hidden />
                  {t("admin.appointments.work")}: {minutesToTime(interval.start)} — {minutesToTime(interval.end)}
                </span>
              ))}
              {plan?.breaks.map((interval, index) => (
                <span key={`break-${index}`} className="flex items-center gap-3 text-xs text-ink-2">
                  <span className="inline-block h-2.5 w-6 border border-line bg-sage-2" aria-hidden />
                  {t("admin.appointments.break")}: {minutesToTime(interval.start)} — {minutesToTime(interval.end)}
                </span>
              ))}
              {plan?.blocked.map((interval, index) => (
                <span key={`blocked-${index}`} className="flex items-center gap-3 text-xs text-ink-2">
                  <span className="inline-block h-2.5 w-6 border border-line bg-canvas-3" aria-hidden />
                  {t("admin.appointments.blocked")}: {minutesToTime(interval.start)} — {minutesToTime(interval.end)}
                </span>
              ))}
              {plan?.booked.map((interval, index) => (
                <span key={`booked-${index}`} className="flex items-center gap-3 text-xs text-ink-2">
                  <span className="inline-block h-2.5 w-6 border border-ink/40 bg-ink/10" aria-hidden />
                  {t("admin.appointments.booked")}: {minutesToTime(interval.start)} — {minutesToTime(interval.end)}
                </span>
              ))}
            </div>
          </div>
          {user.role === "doctor" && (
            <p className="text-xs leading-relaxed text-ink-2">
              {t("admin.access.preVisit")} — {t("admin.access.preVisitHint")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
