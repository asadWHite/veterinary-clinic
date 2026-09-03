import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DoctorCard } from "@/features/doctors/DoctorCard";
import { getServiceBySlug, getServices, getDoctors } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteDoctorIds } from "@/lib/queries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const service = await getServiceBySlug(slug, locale);
  if (!service) return { title: getDictionaryTitle(locale) };
  return {
    title: `${service.title} — ${locale === "ru" ? "Услуги" : locale === "en" ? "Services" : "Xizmatlar"}`,
    description: service.summary,
    alternates: { canonical: `/${locale}/services/${slug}` },
  };
}

function getDictionaryTitle(locale: Locale) {
  return locale === "ru" ? "Услуга не найдена" : locale === "en" ? "Service not found" : "Xizmat topilmadi";
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const { t } = createTranslator(locale);

  const [service, services, doctors, user] = await Promise.all([
    getServiceBySlug(slug, locale),
    getServices(locale),
    getDoctors(locale),
    getCurrentUser(),
  ]);
  if (!service) notFound();

  const favoriteIds = user ? await getFavoriteDoctorIds(user.id) : [];
  const providing = doctors.filter((doctor) => doctor.serviceSlugs.includes(service.slug));
  const related = services.filter((item) => item.slug !== service.slug).slice(0, 4);

  return (
    <article className="border-b border-line">
      <div className="mx-auto w-full max-w-[100rem] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <Link
          href={`/${locale}/services`}
          className="link-underline text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase"
        >
          ← {t("services.title")}
        </Link>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <span className="section-index">01</span>
              <span className="h-px w-10 bg-line" />
            </div>
            <h1 className="text-h1 font-normal tracking-tight text-ink">{service.title}</h1>
            <p className="max-w-2xl text-lg leading-relaxed text-ink-2">{service.summary}</p>
            <div className="max-w-2xl text-[1rem] leading-[1.8] whitespace-pre-line text-ink-2">
              {service.description}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Link href={`/${locale}/book?service=${service.slug}`} className="btn btn-primary">
                {t("services.book")}
              </Link>
              <span className="text-xs text-ink-2">
                {t("services.duration")}: {service.durationMinutes} {t("common.minutesFull")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4 border border-line bg-canvas-2/50 p-6">
              <span className="label-eyebrow">{t("home.doctors.experience")}</span>
              <span className="editorial-serif text-2xl text-forest-2">
                {service.durationMinutes} {t("common.minutesFull")}
              </span>
              <p className="text-sm leading-relaxed text-ink-2">{t("booking.summary.duration")}</p>
            </div>

            <div className="flex flex-col gap-4">
              <span className="label-eyebrow">{t("doctors.title")}</span>
              {providing.length === 0 ? (
                <p className="text-sm text-ink-2">{t("booking.doctor.none")}</p>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {providing.map((doctor, index) => (
                    <DoctorCard
                      key={doctor.slug}
                      doctor={doctor}
                      locale={locale}
                      index={index + 1}
                      services={services}
                      isFavorite={favoriteIds.includes(doctor.id)}
                      canFavorite={Boolean(user)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-line pt-12">
          <span className="label-eyebrow">{t("services.related")}</span>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/${locale}/services/${item.slug}`}
                className="group flex flex-col gap-2 border border-line p-5 transition-colors hover:border-forest"
              >
                <span className="text-lg tracking-tight text-ink">{item.title}</span>
                <span className="text-sm leading-relaxed text-ink-2">{item.summary}</span>
                <span className="mt-2 text-[0.68rem] tracking-[0.16em] text-forest uppercase">
                  {item.durationMinutes} {t("common.minutes")} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
