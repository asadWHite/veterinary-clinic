import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, SectionHeading, StarRating } from "@/components/ui/Bits";
import { ReviewForm } from "@/features/reviews/ReviewForm";
import { getApprovedReviews, getReviewableAppointments, getUserReviews } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { formatDateMedium } from "@/lib/format";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator, getDictionary } from "@/lib/i18n";
import { StatusPill } from "@/components/ui/Bits";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dictionary = getDictionary(isLocale(raw) ? raw : "uz");
  return {
    title: `${dictionary.meta.reviews} — ${dictionary.meta.siteTitle}`,
    description: dictionary.reviewsPage.lead,
    alternates: { canonical: `/${raw}/reviews` },
  };
}

export default async function ReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const { t } = createTranslator(locale);

  const [reviews, user] = await Promise.all([getApprovedReviews(40), getCurrentUser()]);
  const mine = user ? await getUserReviews(user.id, locale) : [];
  const reviewable = user ? await getReviewableAppointments(user.id) : [];
  const average =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null;

  return (
    <div className="border-b border-line">
      <section className="mx-auto w-full max-w-[100rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <SectionHeading
  as="h1"
          index={`01 / ${t("reviewsPage.label")}`}
          title={t("reviewsPage.title")}
          lead={t("reviewsPage.lead")}
        />

        {average !== null && (
          <div className="mt-10 flex items-center gap-4">
            <StarRating value={average} size="md" />
            <span className="text-sm text-ink-2">
              {average.toFixed(1)} {t("reviewsPage.average")} · {reviews.length} {t("reviewsPage.basedOn")}
            </span>
          </div>
        )}

        <div className="mt-14 grid grid-cols-1 gap-16 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {reviews.length === 0 ? (
              <EmptyState
                title={t("reviewsPage.empty")}
                hint={t("reviewsPage.emptyHint")}
                action={
                  <Link href={`/${locale}/book`} className="btn btn-ghost">
                    {t("nav.book")}
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-10 sm:grid-cols-2">
                {reviews.map((review) => (
                  <figure key={review.id} className="flex flex-col gap-4 border-t border-line pt-6">
                    <StarRating value={review.rating} />
                    <blockquote className="text-[1.02rem] leading-relaxed text-ink">
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

          <div className="flex flex-col gap-8">
            <span className="label-eyebrow">{t("reviewsPage.write")}</span>
            {user ? (
              <ReviewForm
                appointments={reviewable.map((appointment) => ({
                  id: appointment.id,
                  publicId: appointment.publicId,
                  day: appointment.day,
                  doctorName: appointment.doctorName,
                }))}
              />
            ) : (
              <div className="flex flex-col gap-4 border border-line bg-canvas-2/40 p-6">
                <p className="text-sm leading-relaxed text-ink-2">{t("reviewsPage.loginRequired")}</p>
                <Link href={`/${locale}/login`} className="btn btn-ghost">
                  {t("auth.login")}
                </Link>
              </div>
            )}

            {mine.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="label-eyebrow">{t("reviewsPage.mine")}</span>
                <ul className="flex flex-col">
                  {mine.map((review) => (
                    <li key={review.id} className="flex flex-col gap-2 border-b border-line py-4">
                      <div className="flex items-center justify-between gap-3">
                        <StarRating value={review.rating} />
                        <StatusPill status={review.status} label={t(`statuses.${review.status}`)} />
                      </div>
                      <p className="text-sm leading-relaxed text-ink-2">{review.body}</p>
                      <span className="text-xs text-ink-2">{review.doctorName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
