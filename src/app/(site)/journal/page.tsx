import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { journalArticles } from "@/data/journal";
import { assetById } from "@/data/animals";
import { monthDayL } from "@/lib/format";
import { getI18n } from "@/i18n/server";
import { pickL } from "@/i18n/localized";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "General educational writing on first visits, vaccination, observation, nutrition, senior care and dental care.",
  alternates: { canonical: "/journal" },
};

export default async function JournalPage() {
  const { t, locale } = await getI18n();
  const [lead, ...rest] = journalArticles;

  return (
    <>
      <section className="shell grid grid-cols-1 gap-8 py-14 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-7">
          <p className="label text-ink/40">{t("nav.journal")}</p>
          <h1 className="display d1 mt-6 uppercase">
            {t("journal.title1")}
            <br />
            <span className="display-serif d1-serif text-moss">{t("journal.title2")}</span>
          </h1>
        </div>
        <div className="lg:col-span-5 lg:pt-24">
          <p className="body-lg max-w-md">{t("journal.intro")}</p>
        </div>
      </section>

      <div className="shell border-t border-[var(--line)] py-12 lg:py-16">
        <Link
          href={`/journal/${lead.slug}`}
          className="group grid grid-cols-1 gap-8 lg:grid-cols-12"
        >
          <div className="lg:col-span-6">
            <Image
              src={assetById(lead.assetId).src}
              alt={assetById(lead.assetId).alt}
              width={1024}
              height={1024}
              priority
              sizes="(max-width: 1024px) 90vw, 50vw"
              className="h-auto w-full select-none transition-transform duration-700 group-hover:scale-[1.02]"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>
          <div className="lg:col-span-6 lg:pl-10 lg:pt-8">
            <p className="label text-forest">
              {pickL(lead.category, locale)} · {lead.readMinutes} {t("journal.minutes")}
            </p>
            <h2 className="display d2 mt-5 uppercase">{pickL(lead.title, locale)}</h2>
            <p className="body-lg mt-6 max-w-lg">{pickL(lead.standfirst, locale)}</p>
            <p className="label mt-8 text-ink/35">{monthDayL(lead.published, locale)}</p>
            <span className="label arrow-forward mt-6 inline-flex items-center gap-3 text-forest">
              {t("common.read")}
              <span className="arrow">→</span>
            </span>
          </div>
        </Link>
      </div>

      <div className="shell grid grid-cols-1 gap-x-8 gap-y-12 border-t border-[var(--line)] py-12 sm:grid-cols-2 lg:grid-cols-3 lg:py-16">
        {rest.map((article, i) => (
          <Reveal key={article.slug} delay={i * 80}>
            <Link href={`/journal/${article.slug}`} className="group block">
              <Image
                src={assetById(article.assetId).src}
                alt={assetById(article.assetId).alt}
                width={1024}
                height={1024}
                sizes="(max-width: 640px) 90vw, 30vw"
                className="h-auto w-full select-none transition-transform duration-700 group-hover:scale-[1.03]"
                style={{ mixBlendMode: "multiply" }}
              />
              <div className="mt-4 border-t border-[var(--line)] pt-3">
                <p className="label text-ink/40">
                  {pickL(article.category, locale)} · {article.readMinutes} {t("home.journal.minutes")}
                </p>
                <h3 className="display d4 mt-3 uppercase">{pickL(article.title, locale)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">{pickL(article.standfirst, locale)}</p>
                <p className="label mt-4 text-ink/35">{monthDayL(article.published, locale)}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
