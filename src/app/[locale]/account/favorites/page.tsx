import Link from "next/link";
import { DoctorCard } from "@/features/doctors/DoctorCard";
import { EmptyState } from "@/components/ui/Bits";
import { getDoctors, getFavoriteDoctorIds, getServices } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AccountFavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t } = createTranslator(locale);
  const user = await getCurrentUser();
  if (!user) return null;

  const [doctors, services, favoriteIds] = await Promise.all([
    getDoctors(locale),
    getServices(locale),
    getFavoriteDoctorIds(user.id),
  ]);
  const favorites = doctors.filter((doctor) => favoriteIds.includes(doctor.id));

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("account.title")}</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("account.favorites.title")}</h1>
        <p className="max-w-xl text-[0.95rem] leading-relaxed text-ink-2">{t("account.favorites.lead")}</p>
      </header>

      {favorites.length === 0 ? (
        <EmptyState
          title={t("account.favorites.empty")}
          hint={t("account.favorites.emptyHint")}
          action={
            <Link href={`/${locale}/doctors`} className="btn btn-ghost">
              {t("home.doctors.viewAll")}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((doctor, index) => (
            <DoctorCard
              key={doctor.slug}
              doctor={doctor}
              locale={locale}
              index={index + 1}
              services={services}
              isFavorite
              canFavorite
            />
          ))}
        </div>
      )}
    </div>
  );
}
