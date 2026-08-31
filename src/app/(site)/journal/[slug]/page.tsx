import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articleBySlug, journalArticles } from "@/data/journal";
import { assetById } from "@/data/animals";
import { monthDayL } from "@/lib/format";
import { getI18n } from "@/i18n/server";
import { pickL } from "@/i18n/localized";

export function generateStaticParams() {
  return journalArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = journalArticles.find((a) => a.slug === slug);
  if (!article) return { title: "Journal" };
  return {
    title: pickL(article.title, "en"),
    description: pickL(article.standfirst, "en"),
    alternates: { canonical: `/journal/${article.slug}` },
    openGraph: {
      type: "article",
      title: pickL(article.title, "en"),
      description: pickL(article.standfirst, "en"),
      publishedTime: article.published,
    },
  };
}

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { t, locale } = await getI18n();
  if (!journalArticles.some((a) => a.slug === slug)) notFound();
  const article = articleBySlug(slug);
  const asset = assetById(article.assetId);
  const more = journalArticles.filter((a) => a.slug !== slug).slice(0, 2);

  return (
    <article>
      <div className="shell pt-12 lg:pt-16">
        <Link href="/journal" className="label link-underline text-ink/45 hover:text-ink">
          {t("journal.backToAll")}
        </Link>
        <p className="label mt-10 text-forest">
          {pickL(article.category, locale)} · {article.readMinutes} {t("journal.minutes")}
        </p>
        <h1 className="display d2 mt-5 max-w-4xl uppercase">{pickL(article.title, locale)}</h1>
        <p className="body-lg mt-6 max-w-2xl">{pickL(article.standfirst, locale)}</p>
        <p className="label mt-6 text-ink/35">{monthDayL(article.published, locale)}</p>
      </div>

      <div className="shell mt-10 lg:mt-14">
        <Image
          src={asset.src}
          alt={asset.alt}
          width={1024}
          height={1024}
          priority
          sizes="90vw"
          className="h-auto w-full max-w-3xl select-none"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>

      <div className="shell grid grid-cols-1 gap-10 py-12 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-8">
          {article.sections.map((section) => (
            <section key={pickL(section.heading, locale)} className="mb-12">
              <h2 className="display d4 uppercase">{pickL(section.heading, locale)}</h2>
              {section.body.map((paragraph) => (
                <p key={pickL(paragraph, locale).slice(0, 32)} className="body-lg mt-5 max-w-2xl">
                  {pickL(paragraph, locale)}
                </p>
              ))}
            </section>
          ))}

          <p className="label max-w-2xl border-t border-[var(--line)] pt-6 leading-[1.9] text-ink/35">
            {t("journal.disclaimer")}
          </p>
        </div>

        <aside className="lg:col-span-4 lg:border-l lg:border-[var(--line)] lg:pl-10">
          <p className="label text-ink/40">{t("journal.readMore")}</p>
          <ul className="mt-6 space-y-8">
            {more.map((item) => (
              <li key={item.slug}>
                <Link href={`/journal/${item.slug}`} className="group block">
                  <Image
                    src={assetById(item.assetId).src}
                    alt=""
                    width={512}
                    height={512}
                    sizes="30vw"
                    className="h-auto w-full select-none transition-transform duration-700 group-hover:scale-[1.03]"
                    style={{ mixBlendMode: "multiply" }}
                  />
                  <p className="label mt-3 text-ink/35">{pickL(item.category, locale)}</p>
                  <p className="display d5 mt-2 uppercase">{pickL(item.title, locale)}</p>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/booking"
            className="label arrow-forward mt-10 flex items-center justify-between gap-3 bg-ink px-6 py-5 text-white"
          >
            {t("common.book")}
            <span className="arrow">→</span>
          </Link>
        </aside>
      </div>
    </article>
  );
}
