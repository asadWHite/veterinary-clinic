import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState, SectionHeading } from "@/components/ui/Bits";
import { getJournalPosts } from "@/lib/queries";
import { formatDateMedium } from "@/lib/format";
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
    title: `${dictionary.meta.journal} — ${dictionary.meta.siteTitle}`,
    description: dictionary.journal.lead,
    alternates: { canonical: `/${raw}/journal` },
  };
}

export default async function JournalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const { t } = createTranslator(locale);
  const posts = await getJournalPosts(locale);

  return (
    <div className="border-b border-line">
      <section className="mx-auto w-full max-w-[100rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <SectionHeading
  as="h1"
          index={`01 / ${t("journal.label")}`}
          title={t("journal.title")}
          lead={t("journal.lead")}
        />

        <div className="mt-14">
          {posts.length === 0 ? (
            <EmptyState title={t("journal.empty")} />
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              {posts.map((post, index) => (
                <Reveal key={post.slug} delay={index * 70} className="h-full">
                  <Link
                    href={`/${locale}/journal/${post.slug}`}
                    className="group flex h-full flex-col gap-5"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas-2">
                      {post.coverUrl && (
                        <Image
                          src={post.coverUrl}
                          alt={post.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="label-eyebrow">
                        {formatDateMedium(post.publishedAt.toISOString().slice(0, 10), locale)}
                        {post.readingMinutes ? ` · ${post.readingMinutes} ${t("journal.minutes")}` : ""}
                      </span>
                      <h2 className="text-2xl tracking-tight text-ink transition-transform duration-500 group-hover:translate-x-1">
                        {post.title}
                      </h2>
                      <p className="text-sm leading-relaxed text-ink-2">{post.excerpt}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
