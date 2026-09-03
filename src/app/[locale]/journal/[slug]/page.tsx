import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJournalPostBySlug, getJournalPosts } from "@/lib/queries";
import { formatDateLong } from "@/lib/format";
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
  const post = await getJournalPostBySlug(slug, locale);
  if (!post) return { title: locale === "ru" ? "Запись не найдена" : "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/${locale}/journal/${slug}` },
    openGraph: { title: post.title, description: post.excerpt, images: post.coverUrl ? [post.coverUrl] : [] },
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const { t } = createTranslator(locale);

  const [post, posts] = await Promise.all([getJournalPostBySlug(slug, locale), getJournalPosts(locale)]);
  if (!post) notFound();
  const related = posts.filter((item) => item.slug !== post.slug).slice(0, 2);

  return (
    <article className="border-b border-line">
      <div className="mx-auto w-full max-w-[76rem] px-5 py-14 sm:px-8 lg:py-20">
        <Link
          href={`/${locale}/journal`}
          className="link-underline text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase"
        >
          ← {t("journal.back")}
        </Link>

        <header className="mt-10 flex flex-col gap-6 border-b border-line pb-10">
          <span className="label-eyebrow">
            {formatDateLong(post.publishedAt.toISOString().slice(0, 10), locale)}
            {post.readingMinutes ? ` · ${post.readingMinutes} ${t("journal.minutes")}` : ""}
          </span>
          <h1 className="text-h1 font-normal tracking-tight text-ink">{post.title}</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-ink-2">{post.excerpt}</p>
        </header>

        {post.coverUrl && (
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden bg-canvas-2">
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 76rem"
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-12 max-w-3xl text-[1.05rem] leading-[1.85] whitespace-pre-line text-ink-2">
          {post.body}
        </div>

        <div className="mt-16 border-t border-line pt-10">
          <span className="label-eyebrow">{t("journal.related")}</span>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/${locale}/journal/${item.slug}`}
                className="group flex flex-col gap-2 border border-line p-5 transition-colors hover:border-forest"
              >
                <span className="label-eyebrow">
                  {formatDateLong(item.publishedAt.toISOString().slice(0, 10), locale)}
                </span>
                <span className="text-xl tracking-tight text-ink">{item.title}</span>
                <span className="text-sm leading-relaxed text-ink-2">{item.excerpt}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
