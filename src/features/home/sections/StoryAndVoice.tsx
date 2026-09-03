import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState, SectionHeading, StarRating } from "@/components/ui/Bits";
import { createTranslator } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { PublicReview } from "@/lib/queries";
import type { JournalCard } from "@/lib/queries";
import { formatDateMedium } from "@/lib/format";

export function StorySection({ locale }: { locale: Locale }) {
  const { t } = createTranslator(locale);
  return (
    <section className="border-b border-line py-20 sm:py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div className="flex flex-col gap-8">
            <SectionHeading
              index={t("home.story.label")}
              title={t("home.story.title")}
            />
            {tList(locale, "home.story.paragraphs").map((_, index) => (
              <Reveal key={index} delay={index * 80}>
                <p className="max-w-xl text-[1rem] leading-[1.75] text-ink-2">
                  {t(`home.story.paragraphs.${index}`)}
                </p>
              </Reveal>
            ))}
            <Reveal delay={240}>
              <div className="grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <span className="section-index">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="text-base tracking-tight text-ink">
                      {t(`home.story.pillars.${index}.title`)}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-2">
                      {t(`home.story.pillars.${index}.body`)}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={100}>
            <div className="relative h-full min-h-[26rem] w-full overflow-hidden bg-canvas-2">
              <Image
                src="/images/clinic-room.jpg"
                alt={t("home.story.title")}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function tList(locale: Locale, path: string): string[] {
  const { tList: list } = createTranslator(locale);
  return list(path);
}

export function JournalSection({
  locale,
  posts,
}: {
  locale: Locale;
  posts: JournalCard[];
}) {
  const { t } = createTranslator(locale);
  const [lead, ...rest] = posts;

  return (
    <section className="border-b border-line bg-canvas-2/50 py-20 sm:py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading index={t("home.journal.label")} title={t("home.journal.title")} />
          <Link href={`/${locale}/journal`} className="link-underline text-[0.72rem] tracking-[0.16em] text-forest uppercase">
            {t("home.journal.viewAll")}
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="mt-12">
            <EmptyState title={t("journal.empty")} hint={t("journal.lead")} />
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            {lead && (
              <Reveal>
                <Link href={`/${locale}/journal/${lead.slug}`} className="group flex flex-col gap-6">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas">
                    {lead.coverUrl && (
                      <Image
                        src={lead.coverUrl}
                        alt={lead.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="label-eyebrow">
                      {formatDateMedium(lead.publishedAt.toISOString().slice(0, 10), locale)}
                      {lead.readingMinutes ? ` · ${lead.readingMinutes} ${t("journal.minutes")}` : ""}
                    </span>
                    <h3 className="text-h2 font-normal tracking-tight text-ink">{lead.title}</h3>
                    <p className="max-w-lg text-[0.95rem] leading-relaxed text-ink-2">{lead.excerpt}</p>
                    <span className="text-[0.7rem] tracking-[0.16em] text-forest uppercase">
                      {t("home.journal.read")} →
                    </span>
                  </div>
                </Link>
              </Reveal>
            )}

            <div className="flex flex-col">
              {rest.map((post, index) => (
                <Reveal key={post.slug} delay={index * 70}>
                  <Link
                    href={`/${locale}/journal/${post.slug}`}
                    className="group grid grid-cols-[1fr_auto] items-start gap-6 border-t border-line py-6 last:border-b"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="label-eyebrow">
                        {formatDateMedium(post.publishedAt.toISOString().slice(0, 10), locale)}
                      </span>
                      <h3 className="text-xl tracking-tight text-ink transition-transform duration-500 group-hover:translate-x-1">
                        {post.title}
                      </h3>
                      <p className="line-clamp-2 max-w-md text-sm leading-relaxed text-ink-2">
                        {post.excerpt}
                      </p>
                    </div>
                    <span className="mt-1 text-[0.7rem] tracking-[0.16em] text-forest uppercase">→</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function ReviewsSection({
  locale,
  reviews,
  average,
  total,
}: {
  locale: Locale;
  reviews: PublicReview[];
  average: number | null;
  total: number;
}) {
  const { t } = createTranslator(locale);
  return (
    <section className="border-b border-line py-20 sm:py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index={t("home.reviews.label")}
            title={t("home.reviews.title")}
            accent={t("home.reviews.titleAccent")}
            lead={t("home.reviews.lead")}
          />
          {total > 0 && average !== null && (
            <div className="flex flex-col gap-2">
              <StarRating value={average} size="md" />
              <span className="text-xs text-ink-2">
                {average.toFixed(1)} {t("reviewsPage.average")} · {total} {t("reviewsPage.basedOn")}
              </span>
            </div>
          )}
        </div>

        <div className="mt-12">
          {reviews.length === 0 ? (
            <EmptyState
              title={t("home.reviews.empty")}
              hint={t("reviewsPage.emptyHint")}
              action={
                <Link href={`/${locale}/book`} className="btn btn-ghost">
                  {t("nav.book")}
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-x-16 sm:grid-cols-2">
              {reviews.map((review, index) => (
                <Reveal key={review.id} delay={index * 60}>
                  <figure className="flex flex-col gap-4 border-t border-line py-7">
                    <StarRating value={review.rating} />
                    <blockquote className="text-[1.05rem] leading-relaxed text-ink">
                      “{review.body}”
                    </blockquote>
                    <figcaption className="text-xs text-ink-2">
                      {review.authorName} · {formatDateMedium(review.createdAt.toISOString().slice(0, 10), locale)}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function CtaSection({ locale }: { locale: Locale }) {
  const { t } = createTranslator(locale);
  const settings = null;
  void settings;
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[32rem] w-full">
        <Image
          src="/images/cta-dog.jpg"
          alt={t("home.cta.imageAlt")}
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/70 to-canvas/10" />
        <div className="relative mx-auto flex min-h-[32rem] w-full max-w-[100rem] flex-col justify-end px-5 pt-24 pb-16 sm:px-8 lg:px-12">
          <Reveal>
            <span className="section-index">{t("home.cta.label")}</span>
            <h2 className="mt-6 max-w-3xl text-h1 font-normal tracking-tight text-ink">
              {t("home.cta.title")} <span className="editorial-serif text-forest-2">{t("home.cta.titleAccent")}</span>
            </h2>
            <p className="mt-6 max-w-xl text-[1rem] leading-relaxed text-ink-2">{t("home.cta.lead")}</p>
            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
              <Link href={`/${locale}/book`} className="btn btn-primary">
                {t("home.cta.button")}
              </Link>
              <div className="flex flex-col gap-1 text-xs leading-relaxed text-ink-2">
                <a href="tel:+998994064640" className="link-underline w-fit text-sm text-ink">
                  +998 99 406 46 40
                </a>
                <a href="tel:+998987004640" className="link-underline w-fit text-sm text-ink">
                  +998 98 700 46 40
                </a>
                <span>{t("contact.urgentNote")}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
