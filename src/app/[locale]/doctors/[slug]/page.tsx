import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/features/doctors/FavoriteButton";
import { EmptyState, StarRating } from "@/components/ui/Bits";
import {
  getApprovedReviews,
  getDoctorBySlug,
  getFavoriteDoctorIds,
  getServices,
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { formatDateMedium } from "@/lib/format";
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
  const doctor = await getDoctorBySlug(slug, locale);
  if (!doctor) return { title: locale === "ru" ? "Врач не найден" : "Doctor not found" };
  return {
    title: `${doctor.name} — ${doctor.title}`,
    description: doctor.bio,
    alternates: { canonical: `/${locale}/doctors/${slug}` },
  };
}

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const { t, tList } = createTranslator(locale);

  const [doctor, services, user, reviews] = await Promise.all([
    getDoctorBySlug(slug, locale),
    getServices(locale),
    getCurrentUser(),
    getApprovedReviews(24),
  ]);
  if (!doctor) notFound();

  const favoriteIds = user ? await getFavoriteDoctorIds(user.id) : [];
  const doctorReviews = reviews.filter((review) => review.doctorSlug === doctor.slug);
  const weekdays = tList("common.weekdaysShort");
  const doctorServices = services.filter((service) => doctor.serviceSlugs.includes(service.slug));

  return (
    <article className="border-b border-line">
      <div className="mx-auto w-full max-w-[100rem] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <Link
          href={`/${locale}/doctors`}
          className="link-underline text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase"
        >
          ← {t("doctors.title")}
        </Link>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-canvas-2">
              {doctor.photoUrl ? (
                <Image
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col justify-between p-8">
                  <span className="section-index">01</span>
                  <span className="editorial-serif text-4xl leading-tight text-forest-2">
                    {doctor.title}
                  </span>
                  <span className="label-eyebrow">{doctor.languages.join(" · ").toUpperCase()}</span>
                </div>
              )}
            </div>
            {user && (
              <FavoriteButton
                doctorId={doctor.id}
                initialActive={favoriteIds.includes(doctor.id)}
                variant="button"
              />
            )}
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="label-eyebrow">{doctor.title}</span>
              <h1 className="text-h1 font-normal tracking-tight text-ink">{doctor.name}</h1>
              <p className="max-w-2xl text-lg leading-relaxed text-ink-2">{doctor.bio}</p>
            </div>

            <dl className="grid grid-cols-2 gap-8 border-t border-line pt-8 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <dt className="label-eyebrow">{t("home.doctors.experience")}</dt>
                <dd className="text-lg text-ink">
                  {doctor.experienceYears ?? t("common.notConfigured")}
                </dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="label-eyebrow">{t("home.doctors.languages")}</dt>
                <dd className="text-lg text-ink">{doctor.languages.join(", ").toUpperCase()}</dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="label-eyebrow">{t("home.doctors.reviewsCount")}</dt>
                <dd className="flex items-center gap-2 text-lg text-ink">
                  {doctor.reviewCount > 0 && doctor.averageRating !== null ? (
                    <>
                      <StarRating value={doctor.averageRating} size="md" />
                      <span>{doctor.reviewCount}</span>
                    </>
                  ) : (
                    <span className="text-sm text-ink-2">{t("home.doctors.noReviews")}</span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-4">
              <span className="label-eyebrow">{t("home.doctors.schedule")}</span>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day, position) => (
                  <span
                    key={day}
                    className={
                      doctor.weekdayBits & (1 << position)
                        ? "border border-forest px-3 py-1.5 text-xs text-forest"
                        : "border border-line px-3 py-1.5 text-xs text-sage"
                    }
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="label-eyebrow">{t("home.doctors.services")}</span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {doctorServices.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/${locale}/book?service=${service.slug}&doctor=${doctor.slug}`}
                    className="group flex items-baseline justify-between gap-4 border border-line px-4 py-3 transition-colors hover:border-forest"
                  >
                    <span className="text-sm text-ink">{service.title}</span>
                    <span className="text-xs text-ink-2">{service.durationMinutes} {t("common.minutes")}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-line pt-8">
              <Link href={`/${locale}/book?doctor=${doctor.slug}`} className="btn btn-primary">
                {t("doctors.book")}
              </Link>
              <span className="text-xs text-ink-2">{t("booking.datetime.lead")}</span>
            </div>

            <div className="flex flex-col gap-5 border-t border-line pt-10">
              <span className="label-eyebrow">{t("doctors.reviews")}</span>
              {doctorReviews.length === 0 ? (
                <EmptyState title={t("home.reviews.empty")} hint={t("reviewsPage.emptyHint")} />
              ) : (
                <div className="grid gap-8 sm:grid-cols-2">
                  {doctorReviews.map((review) => (
                    <figure key={review.id} className="flex flex-col gap-3 border-t border-line pt-5">
                      <StarRating value={review.rating} />
                      <blockquote className="text-[0.98rem] leading-relaxed text-ink">
                        “{review.body}”
                      </blockquote>
                      <figcaption className="text-xs text-ink-2">
                        {review.authorName} ·{" "}
                        {formatDateMedium(review.createdAt.toISOString().slice(0, 10), locale)}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
