import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/hero/Hero";
import { EmotionalHook } from "@/components/home/EmotionalHook";
import { SpeciesSelector } from "@/components/home/SpeciesSelector";
import { CareIndex } from "@/components/home/CareIndex";
import { DoctorsPreview } from "@/components/home/DoctorsPreview";
import { EmergencyBand } from "@/components/home/EmergencyBand";
import { FinalCta } from "@/components/home/FinalCta";
import { Marquee } from "@/components/ui/Marquee";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { journalArticles } from "@/data/journal";
import { assetById } from "@/data/animals";
import { site } from "@/lib/site";
import { monthDayL } from "@/lib/format";
import { getI18n } from "@/i18n/server";
import { pickL } from "@/i18n/localized";
import { careItems } from "@/data/care";

export const dynamic = "force-dynamic";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VeterinaryCare",
  name: site.name,
  description:
    "Modern veterinary care built around prevention, quiet observation and calm handling.",
  url: site.url,
  address: { "@type": "PostalAddress", streetAddress: site.address, addressLocality: site.city },
  telephone: site.phone,
  email: site.email,
  openingHours: site.hours,
  animalService: ["Dogs", "Cats", "Small companions", "Birds"],
};

export default async function HomePage() {
  const { t, locale, dict } = await getI18n();
  const featured = journalArticles.slice(0, 3);
  const marqueeItems = [
    t("marquee.prevention"),
    t("marquee.diagnosis"),
    t("marquee.surgery"),
    t("marquee.dentistry"),
    t("marquee.dermatology"),
    t("marquee.diagnostics"),
    t("marquee.seniorCare"),
    t("marquee.nutrition"),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero />

      <Marquee items={marqueeItems} />

      <EmotionalHook />

      {/* 03 — Animal types */}
      <div className="border-t border-[var(--line)] bg-paper py-14 lg:py-20">
        <SectionHeader index="03" label={t("home.species.label")}>
          <h2 className="display d2 uppercase">
            {t("home.species.title1")}
            <br />
            {t("home.species.title2")}
            <br />
            <span className="text-forest">{t("home.species.title3")}</span>
          </h2>
        </SectionHeader>
        <div className="mt-10">
          <SpeciesSelector />
        </div>
      </div>

      {/* 04 — Care */}
      <div className="bg-canvas py-14 lg:py-20">
        <SectionHeader index="04" label={t("home.care.label")}>
          <h2 className="display d2 uppercase">
            {t("home.care.title1")}
            <br />
            {t("home.care.title2")}
          </h2>
        </SectionHeader>
        <div className="mt-10">
          <CareIndex />
        </div>
      </div>

      {/* 05 — Doctors */}
      <div className="border-t border-[var(--line)] bg-paper py-14 lg:py-20">
        <SectionHeader index="05" label={t("home.doctors.label")} />
        <div className="mt-10">
          <DoctorsPreview />
        </div>
      </div>

      {/* Journal strip */}
      <div className="border-t border-[var(--line)] bg-cream/60 py-14 lg:py-20">
        <SectionHeader index="06" label={t("home.journal.label")}>
          <h2 className="display d3 uppercase">{t("home.journal.title")}</h2>
        </SectionHeader>
        <div className="shell mt-10 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
          {featured.map((article, i) => {
            const asset = assetById(article.assetId);
            return (
              <Reveal key={article.slug} delay={i * 100}>
                <Link href={`/journal/${article.slug}`} className="group block">
                  <div className="overflow-hidden">
                    <Image
                      src={asset.src}
                      alt={asset.alt}
                      width={1024}
                      height={1024}
                      sizes="(max-width: 768px) 90vw, 30vw"
                      className="h-auto w-full select-none transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      style={{ mixBlendMode: "multiply" }}
                    />
                  </div>
                  <div className="mt-4 border-t border-[var(--line)] pt-3">
                    <p className="label text-ink/40">
                      {pickL(article.category, locale)} · {article.readMinutes} {t("home.journal.minutes")}
                    </p>
                    <h3 className="display d5 mt-3 uppercase">{pickL(article.title, locale)}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/60">{pickL(article.standfirst, locale)}</p>
                    <p className="label mt-4 text-ink/35">{monthDayL(article.published, locale)}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>

      <EmergencyBand />
      <FinalCta />
    </>
  );
}
