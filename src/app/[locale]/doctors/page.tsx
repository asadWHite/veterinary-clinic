import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState, SectionHeading } from "@/components/ui/Bits";
import { DoctorCard } from "@/features/doctors/DoctorCard";
import { getDoctors, getFavoriteDoctorIds, getServices } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dictionary = getDictionary(isLocale(raw) ? raw : "uz");
  return {
    title: `${dictionary.meta.doctors} — ${dictionary.meta.siteTitle}`,
    description: dictionary.doctors.lead,
    alternates: { canonical: `/${raw}/doctors` },
  };
}

export default async function DoctorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const { t } = createTranslator(locale);

  const [doctors, services, user] = await Promise.all([
    getDoctors(locale),
    getServices(locale),
    getCurrentUser(),
  ]);
  const favoriteIds = user ? await getFavoriteDoctorIds(user.id) : [];

  return (
    <div className="border-b border-line">
      <section className="mx-auto w-full max-w-[100rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <SectionHeading
  as="h1"
          index={`01 / ${t("doctors.label")}`}
          title={t("doctors.title")}
          lead={t("doctors.lead")}
        />
        <p className="mt-8 max-w-2xl border-l-2 border-sage pl-5 text-sm leading-relaxed text-ink-2">
          {t("doctors.placeholderNotice")}
        </p>

        <div className="mt-14">
          {doctors.length === 0 ? (
            <EmptyState title={t("errors.dbUnavailable")} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {doctors.map((doctor, index) => (
                <Reveal key={doctor.slug} delay={index * 70} className="h-full">
                  <DoctorCard
                    doctor={doctor}
                    locale={locale}
                    index={index + 1}
                    services={services}
                    isFavorite={favoriteIds.includes(doctor.id)}
                    canFavorite={Boolean(user)}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
