import { EmptyState, StarRating, StatusPill } from "@/components/ui/Bits";
import { moderateReviewAction } from "@/features/admin/actions";
import { getAdminReviews } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { formatDateMedium } from "@/lib/format";
import { pickLocalized } from "@/lib/i18n/config";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t } = createTranslator(locale);
  const user = await getCurrentUser();
  if (!user || user.role === "user") return null;

  const reviews = await getAdminReviews();
  const grouped = {
    pending: reviews.filter((review) => review.status === "pending"),
    approved: reviews.filter((review) => review.status === "approved"),
    rejected: reviews.filter((review) => review.status === "rejected"),
  };

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("admin.title")}</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("admin.reviews.title")}</h1>
      </header>

      <div className="grid grid-cols-3 gap-6 border-y border-line py-6">
        {(["pending", "approved", "rejected"] as const).map((key) => (
          <div key={key} className="flex flex-col gap-1">
            <span className="label-eyebrow">{t(`admin.reviews.${key}`)}</span>
            <span className="font-serif text-3xl text-ink">{grouped[key].length}</span>
          </div>
        ))}
      </div>

      {reviews.length === 0 ? (
        <EmptyState title={t("admin.reviews.empty")} hint={t("reviewsPage.lead")} />
      ) : (
        <ul className="flex flex-col">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-4 border-t border-line py-6 last:border-b">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StarRating value={review.rating} />
                  <span className="text-sm text-ink">{review.authorName}</span>
                  <span className="text-xs text-ink-2">
                    {pickLocalized(review.doctorName, locale)} ·{" "}
                    {formatDateMedium(review.createdAt.toISOString().slice(0, 10), locale)}
                  </span>
                </div>
                <StatusPill status={review.status} label={t(`statuses.${review.status}`)} />
              </div>
              <p className="max-w-3xl text-sm leading-relaxed text-ink-2">{review.body}</p>
              <div className="flex flex-wrap gap-3">
                {(["approved", "rejected", "pending"] as const).map((status) => (
                  <form key={status} action={moderateReviewAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="status" value={status} />
                    <button
                      type="submit"
                      className="btn btn-quiet !py-2.5 !px-4 !text-[0.65rem]"
                      disabled={review.status === status}
                    >
                      {status === "approved"
                        ? t("admin.reviews.approve")
                        : status === "rejected"
                          ? t("admin.reviews.reject")
                          : t("admin.reviews.pending")}
                    </button>
                  </form>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
