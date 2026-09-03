import { EmptyState } from "@/components/ui/Bits";
import {
  blockPeriodAction,
  deleteAvailabilityRuleAction,
  saveAvailabilityRuleAction,
  unblockPeriodAction,
} from "@/features/admin/actions";
import { getDoctorBlockedSlots, getDoctorScheduleRules, getDoctors } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { formatDateShort, minutesToTime } from "@/lib/format";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t, tList } = createTranslator(locale);
  const user = await getCurrentUser();
  if (!user || user.role === "user") return null;

  const doctors = await getDoctors(locale);
  const weekdays = tList("common.weekdays");
  const scoped = user.role === "doctor" ? doctors.filter((doctor) => doctor.id === user.doctorId) : doctors;

  const rulesByDoctor = await Promise.all(scoped.map((doctor) => getDoctorScheduleRules(doctor.id)));
  const blocksByDoctor = await Promise.all(scoped.map((doctor) => getDoctorBlockedSlots(doctor.id)));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("admin.title")}</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("admin.schedule.title")}</h1>
        <p className="max-w-xl text-[0.95rem] leading-relaxed text-ink-2">{t("admin.schedule.lead")}</p>
      </header>

      {scoped.length === 0 ? (
        <EmptyState title={t("admin.schedule.empty")} />
      ) : (
        scoped.map((doctor, doctorIndex) => (
          <section key={doctor.id} className="flex flex-col gap-6 border-t border-line pt-8">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl tracking-tight text-ink">
                {doctor.name} · <span className="editorial-serif text-forest-2">{doctor.title}</span>
              </h2>
              <span className="section-index">{String(doctorIndex + 1).padStart(2, "0")}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line">
                    {[t("admin.schedule.weekday"), t("admin.schedule.work"), t("common.delete")].map((heading, index) => (
                      <th key={index} className="py-3 pr-4 text-[0.62rem] tracking-[0.16em] text-ink-2 uppercase">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rulesByDoctor[doctorIndex].length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-sm text-ink-2">
                        {t("admin.schedule.empty")}
                      </td>
                    </tr>
                  )}
                  {rulesByDoctor[doctorIndex].map((rule) => (
                    <tr key={rule.id} className="border-b border-line">
                      <td className="py-3 pr-4 text-ink">{weekdays[rule.weekday]}</td>
                      <td className="py-3 pr-4">
                        <span className={rule.kind === "break" ? "text-ink-2" : "text-ink"}>
                          {rule.kind === "break" ? t("admin.schedule.break") : t("admin.schedule.work")}:{" "}
                          {minutesToTime(rule.startMinute)} — {minutesToTime(rule.endMinute)}
                        </span>
                      </td>
                      <td className="py-3">
                        <form action={deleteAvailabilityRuleAction}>
                          <input type="hidden" name="id" value={rule.id} />
                          <button type="submit" className="link-underline text-xs text-ink-2 uppercase">
                            {t("admin.schedule.remove")}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form
              action={saveAvailabilityRuleAction}
              className="grid grid-cols-2 gap-4 border border-line bg-canvas-2/40 p-5 sm:grid-cols-5"
            >
              <input type="hidden" name="doctorId" value={doctor.id} />
              <label className="flex flex-col gap-2">
                <span className="label-eyebrow">{t("admin.schedule.weekday")}</span>
                <select name="weekday" className="field-input" defaultValue="0">
                  {weekdays.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="label-eyebrow">{t("admin.schedule.work")}</span>
                <select name="kind" className="field-input" defaultValue="work">
                  <option value="work">{t("admin.schedule.work")}</option>
                  <option value="break">{t("admin.schedule.break")}</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="label-eyebrow">{t("admin.schedule.from")}</span>
                <input type="time" name="start" defaultValue="09:00" className="field-input" required />
              </label>
              <label className="flex flex-col gap-2">
                <span className="label-eyebrow">{t("admin.schedule.to")}</span>
                <input type="time" name="end" defaultValue="13:00" className="field-input" required />
              </label>
              <div className="flex items-end">
                <button type="submit" className="btn btn-primary w-full !py-3">
                  {t("admin.schedule.add")}
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-4">
              <span className="label-eyebrow">{t("admin.schedule.blockedTitle")}</span>
              {blocksByDoctor[doctorIndex].length === 0 ? (
                <p className="text-sm text-ink-2">{t("common.none")}</p>
              ) : (
                <ul className="flex flex-col">
                  {blocksByDoctor[doctorIndex].map((block) => (
                    <li key={block.id} className="flex items-center justify-between gap-4 border-b border-line py-3">
                      <span className="text-sm text-ink">
                        {formatDateShort(block.day, locale)} · {minutesToTime(block.startMinute)} —{" "}
                        {minutesToTime(block.endMinute)}
                        {block.reason ? ` · ${block.reason}` : ""}
                      </span>
                      <form action={unblockPeriodAction}>
                        <input type="hidden" name="id" value={block.id} />
                        <button type="submit" className="link-underline text-xs text-ink-2 uppercase">
                          {t("admin.schedule.unblock")}
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}

              <form action={blockPeriodAction} className="grid grid-cols-2 gap-4 border border-line p-5 sm:grid-cols-5">
                <input type="hidden" name="doctorId" value={doctor.id} />
                <label className="flex flex-col gap-2">
                  <span className="label-eyebrow">{t("admin.schedule.day")}</span>
                  <input type="date" name="day" required className="field-input" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="label-eyebrow">{t("admin.schedule.from")}</span>
                  <input type="time" name="start" defaultValue="15:00" required className="field-input" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="label-eyebrow">{t("admin.schedule.to")}</span>
                  <input type="time" name="end" defaultValue="17:00" required className="field-input" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="label-eyebrow">{t("admin.schedule.reason")}</span>
                  <input name="reason" className="field-input" />
                </label>
                <div className="flex items-end">
                  <button type="submit" className="btn btn-ghost w-full !py-3">
                    {t("admin.schedule.block")}
                  </button>
                </div>
              </form>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
