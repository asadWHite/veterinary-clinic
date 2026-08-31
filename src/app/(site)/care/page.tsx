import { getI18n } from "@/i18n/server";
import { pickL } from "@/i18n/localized";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getServices } from "@/lib/clinic";
import { assetById } from "@/data/animals";
import { durationLabelL } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Care",
  description:
    "General care, vaccination, diagnostics, dental, surgery and dermatology — what each visit involves and how long it takes.",
  alternates: { canonical: "/care" },
};

export default async function CarePage() {
  const [{ t, locale }, services] = await Promise.all([getI18n(), getServices()]);

  return (
    <>
      <section className="shell grid grid-cols-1 gap-8 py-14 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-7">
          <p className="label text-ink/40">{t("nav.care")}</p>
          <h1 className="display d1 mt-6 uppercase">
            {t("care.title1")}
            <br />
            {t("care.title2")}
          </h1>
        </div>
        <div className="lg:col-span-5 lg:pt-24">
          <p className="body-lg max-w-md">{t("care.intro")}</p>
        </div>
      </section>

      <div className="shell border-t border-[var(--line)]">
        <ul className="vdivide">
          {services.map((service, i) => (
            <li key={service.id} id={service.slug} className="scroll-mt-24 py-8 lg:py-16">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-2">
                  <span className="display d3 mono-num text-ink/20">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="lg:col-span-4">
                  <p className="label text-forest">{pickL(service.category, locale)}</p>
                  <h2 className="display d3 mt-4 uppercase">{pickL(service.name, locale)}</h2>
                  <p className="label mt-4 text-ink/40">
                    {durationLabelL(service.durationMinutes, locale)} · {t("care.from")} {service.priceFrom}
                  </p>
                </div>
                <div className="lg:col-span-3">
                  <p className="body-lg">{pickL(service.description, locale)}</p>
                  <Link
                    href="/booking"
                    className="label arrow-forward mt-6 inline-flex items-center gap-3 border border-[var(--line)] px-5 py-4 hover:border-ink"
                  >
                    {t("care.bookThis")}
                    <span className="arrow">→</span>
                  </Link>
                </div>
                <div className="lg:col-span-3">
                  <Reveal variant="scale">
                    <Image
                      src={assetById(
                        [
                          "golden-retriever",
                          "puppy",
                          "kitten",
                          "british-shorthair",
                          "french-bulldog",
                          "siamese",
                          "rabbit",
                          "cockatiel",
                          "golden-retriever",
                          "british-shorthair",
                        ][i] ?? "puppy",
                      ).src}
                      alt=""
                      width={1024}
                      height={1024}
                      sizes="(max-width: 1024px) 90vw, 25vw"
                      className="h-auto w-full select-none"
                      style={{ mixBlendMode: "multiply" }}
                    />
                  </Reveal>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="py-9 lg:py-20">
        <SectionHeader index="11" label={t("care.notSureLabel")} />
        <div className="shell grid grid-cols-1 gap-8 py-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="display d3 uppercase">
              {t("care.notSureTitle1")}
              <br />
              {t("care.notSureTitle2")}
            </h2>
            <p className="body-lg mt-6 max-w-lg">{t("care.notSureBody")}</p>
          </div>
          <div className="lg:col-span-5 lg:pt-4">
            <Link
              href="/booking"
              className="label arrow-forward flex items-center justify-between gap-6 bg-ink px-8 py-6 text-white"
            >
              <span className="display d5 uppercase">{t("care.notSureCta")}</span>
              <span className="arrow text-2xl">→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
