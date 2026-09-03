import { saveClinicSettingsAction } from "@/features/admin/actions";
import { getCurrentUser } from "@/lib/auth";
import { getClinicSettings } from "@/lib/settings";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
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

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("admin.title")}</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("admin.settings.title")}</h1>
        <p className="max-w-xl text-[0.95rem] leading-relaxed text-ink-2">{t("admin.settings.lead")}</p>
        <p className="max-w-xl text-xs leading-relaxed text-ink-2">{t("admin.settings.placeholderHint")}</p>
      </header>

      <form action={saveClinicSettingsAction} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {(["uz", "ru", "en"] as const).map((code) => (
            <label key={`name-${code}`} className="flex flex-col gap-2">
              <span className="label-eyebrow">
                {t("admin.settings.clinicName")} ({code.toUpperCase()})
              </span>
              <input
                name={`clinicName${code.toUpperCase()}`}
                defaultValue={settings.clinicName?.[code] ?? ""}
                className="field-input"
              />
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="label-eyebrow">{t("admin.settings.phone")}</span>
            <input name="phone" defaultValue={settings.phone ?? ""} className="field-input" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label-eyebrow">{t("admin.settings.phone2")}</span>
            <input name="phone2" defaultValue={settings.phone2 ?? ""} className="field-input" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label-eyebrow">{t("admin.settings.email")}</span>
            <input name="email" type="email" defaultValue={settings.email ?? ""} className="field-input" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label-eyebrow">{t("admin.settings.emergencyPhone")}</span>
            <input name="emergencyPhone" defaultValue={settings.emergencyPhone ?? ""} className="field-input" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label-eyebrow">{t("admin.settings.instagram")}</span>
            <input name="instagram" defaultValue={settings.instagram ?? ""} className="field-input" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label-eyebrow">{t("admin.settings.lastAppointment")}</span>
            <input name="lastAppointment" defaultValue={settings.lastAppointment ?? ""} className="field-input" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label-eyebrow">{t("admin.settings.timezone")}</span>
            <input name="timezone" defaultValue={settings.timezone} className="field-input" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {(["uz", "ru", "en"] as const).map((code) => (
            <label key={`hours-${code}`} className="flex flex-col gap-2">
              <span className="label-eyebrow">
                {t("admin.settings.hours")} ({code.toUpperCase()})
              </span>
              <input
                name={`hours${code.toUpperCase()}`}
                defaultValue={settings.hours?.[code] ?? ""}
                className="field-input"
              />
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {(["uz", "ru", "en"] as const).map((code) => (
            <label key={`address-${code}`} className="flex flex-col gap-2">
              <span className="label-eyebrow">
                {t("admin.settings.address")} ({code.toUpperCase()})
              </span>
              <input
                name={`address${code.toUpperCase()}`}
                defaultValue={settings.address?.[code] ?? ""}
                className="field-input"
              />
            </label>
          ))}
        </div>

        <button type="submit" className="btn btn-primary self-start">
          {t("common.save")}
        </button>
      </form>
    </div>
  );
}
