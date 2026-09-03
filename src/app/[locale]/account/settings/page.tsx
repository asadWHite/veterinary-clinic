import { PasswordForm, ProfileForm } from "@/features/account/SettingsForms";
import { getCurrentUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t } = createTranslator(locale);
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("account.title")}</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("account.settings.title")}</h1>
        <p className="max-w-xl text-[0.95rem] leading-relaxed text-ink-2">{t("account.settings.lead")}</p>
      </header>

      <section className="flex flex-col gap-5">
        <span className="label-eyebrow">{t("account.settings.profile")}</span>
        <ProfileForm
          fullName={user.fullName}
          phone={user.phone ?? ""}
          email={user.email}
          locale={user.locale}
        />
      </section>

      <section className="flex flex-col gap-5">
        <span className="label-eyebrow">{t("account.settings.password")}</span>
        <PasswordForm />
      </section>
    </div>
  );
}
