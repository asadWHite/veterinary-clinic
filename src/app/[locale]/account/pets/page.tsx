import { PetManager } from "@/features/account/PetManager";
import { getPets } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AccountPetsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t } = createTranslator(locale);
  const user = await getCurrentUser();
  if (!user) return null;
  const pets = await getPets(user.id);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("account.title")}</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("account.pets.title")}</h1>
        <p className="max-w-xl text-[0.95rem] leading-relaxed text-ink-2">{t("account.pets.lead")}</p>
      </header>
      <PetManager pets={pets} />
    </div>
  );
}
