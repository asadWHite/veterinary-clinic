import Link from "next/link";
import { EmptyState, StarRating, StatusPill } from "@/components/ui/Bits";
import { getUserReviews } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { formatDateMedium } from "@/lib/format";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AccountReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t } = createTranslator(locale);
  const user = await getCurrentUser();
  if (!user) return null;
  const reviews = await getUserReviews(user.id, locale);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("account.title")}</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("account.reviews.title")}</h1>
        <p className="max-w-xl text-[0.95rem] leading-relaxed text-ink-2">{t("account.reviews.lead")}</p>
      </header>

      {reviews.length === 0 ? (
        <EmptyState
          title={t("account.reviews.empty")}
          hint={t("reviewsPage.notEligible")}
          action={
            <Link href={`/${locale}/account/appointments`} className="btn btn-ghost">
              {t("account.appointments.title")}
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-3 border-t border-line py-5 last:border-b">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StarRating value={review.rating} />
                <div className="flex items-center gap-3">
                  <StatusPill status={review.status} label={t(`statuses.${review.status}`)} />
                  <span className="text-xs text-ink-2">
                    {formatDateMedium(review.createdAt.toISOString().slice(0, 10), locale)}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-ink-2">{review.body}</p>
              <span className="text-xs text-ink-2">{review.doctorName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
