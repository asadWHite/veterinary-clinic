import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Bits";
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
    title: `${dictionary.nav.about} — ${dictionary.meta.siteTitle}`,
    description: dictionary.home.story.paragraphs[0],
    alternates: { canonical: `/${raw}/about` },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const { t } = createTranslator(locale);

  return (
    <div className="border-b border-line">
      <section className="mx-auto w-full max-w-[100rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <SectionHeading as="h1" index={`01 / ${t("nav.about")}`} title={t("home.story.title")} />

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            {tListSafe(locale, "home.story.paragraphs").map((_, index) => (
              <Reveal key={index} delay={index * 70}>
                <p className="max-w-2xl text-[1.05rem] leading-[1.85] text-ink-2">
                  {t(`home.story.paragraphs.${index}`)}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={100}>
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-canvas-2">
              <Image
                src="/images/clinic-room.jpg"
                alt={t("home.story.title")}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-10 border-t border-line pt-12 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex flex-col gap-3">
              <span className="section-index">{String(index + 1).padStart(2, "0")}</span>
              <h2 className="text-xl tracking-tight text-ink">
                {t(`home.story.pillars.${index}.title`)}
              </h2>
              <p className="text-sm leading-relaxed text-ink-2">
                {t(`home.story.pillars.${index}.body`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 gap-10 border-t border-line pt-12 lg:grid-cols-2">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex flex-col gap-3">
              <span className="section-index">{String(index + 1).padStart(2, "0")}</span>
              <h2 className="text-2xl tracking-tight text-ink">
                {t(`home.philosophy.items.${index}.title`)}
              </h2>
              <p className="max-w-lg text-[0.95rem] leading-relaxed text-ink-2">
                {t(`home.philosophy.items.${index}.body`)}
              </p>
            </div>
          ))}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-canvas-2">
            <Image
              src="/images/vet-hands-puppy.jpg"
              alt={t("home.philosophy.items.1.title")}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-20 flex flex-col items-start gap-6 border-t border-line pt-12">
          <h2 className="text-h2 font-normal tracking-tight text-ink">
            {t("home.cta.title")} <span className="editorial-serif text-forest-2">{t("home.cta.titleAccent")}</span>
          </h2>
          <Link href={`/${locale}/book`} className="btn btn-primary">
            {t("home.cta.button")}
          </Link>
        </div>
      </section>
    </div>
  );
}

function tListSafe(locale: Locale, path: string): string[] {
  const { tList } = createTranslator(locale);
  return tList(path);
}
