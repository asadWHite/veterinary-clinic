import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DoctorPortrait } from "@/components/doctors/DoctorPortrait";
import { getDoctorsWithAvailability } from "@/lib/clinic";
import { site } from "@/lib/site";
import { getI18n } from "@/i18n/server";
import { pickL } from "@/i18n/localized";
import { specialtyOf } from "@/data/doctors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Our approach, our team, our clinic — and why we care. Placeholder details pending launch.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [{ t, locale, dict }, doctors] = await Promise.all([
    getI18n(),
    getDoctorsWithAvailability(30),
  ]);

  return (
    <>
      <section className="shell grid grid-cols-1 gap-8 py-14 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-7">
          <p className="label text-ink/40">{t("nav.about")}</p>
          <h1 className="display d1 mt-6 uppercase">
            {t("about.title").split(" ")[0]}
            <br />
            <span className="text-forest">{t("about.title").split(" ").slice(1).join(" ")}</span>
          </h1>
        </div>
        <div className="lg:col-span-5 lg:pt-24">
          <p className="body-lg max-w-md">{t("about.intro1", { clinic: site.name })}</p>
          <p className="body-lg mt-5 max-w-md">{t("about.intro2")}</p>
        </div>
      </section>

      {/* OUR APPROACH */}
      <div className="py-14 lg:py-20">
        <SectionHeader index="01" label={t("about.approachLabel")} />
        <div className="shell grid grid-cols-1 gap-10 py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-5">
            <Reveal variant="scale">
              <Image
                src="/images/animals/cat-siamese-white.jpg"
                alt="Siamese cat on a pure white background"
                width={1024}
                height={1024}
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="h-auto w-full select-none"
                style={{ mixBlendMode: "multiply" }}
              />
            </Reveal>
          </div>
          <div className="lg:col-span-7 lg:pl-10">
            <h2 className="display d3 uppercase">{t("about.approachTitle")}</h2>
            <div className="mt-8 space-y-6">
              {dict.about.principles.map((item, i) => (
                <Reveal key={item.k} delay={i * 80}>
                  <div className="border-t border-[var(--line)] pt-5">
                    <p className="label mono-num text-ink/30">0{i + 1}</p>
                    <p className="display d5 mt-3 uppercase">{item.k}</p>
                    <p className="body-lg mt-3 max-w-xl">{item.v}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* OUR TEAM */}
      <div className="py-14 lg:py-20">
        <SectionHeader index="02" label={t("about.teamLabel")} />
        <div className="shell py-12 lg:py-16">
          <h2 className="display d3 uppercase max-w-3xl">{t("about.teamTitle")}</h2>
          <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((doctor, i) => (
              <Reveal key={doctor.id} delay={i * 90}>
                <div>
                  <DoctorPortrait doctor={doctor} className="aspect-[4/5] w-full" />
                  <div className="mt-4 border-t border-[var(--line)] pt-3">
                    <p className="label text-ink/35">{t("home.doctors.code")} {doctor.code}</p>
                    <p className="display d5 mt-2 uppercase">{doctor.name}</p>
                    <p className="mt-2 text-[0.8rem] leading-snug text-ink/55">
                      {specialtyOf(doctor.slug, locale)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="label mt-12 max-w-lg leading-[1.9] text-ink/35">{t("about.teamNote")}</p>
        </div>
      </div>

      {/* OUR CLINIC */}
      <div className="border-t border-[var(--line)] py-14 lg:py-20">
        <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label text-ink/40">{t("about.clinicLabel")}</p>
            <h2 className="display d3 mt-6 uppercase">{t("about.clinicTitle")}</h2>
            <p className="body-lg mt-6 max-w-md">{t("about.clinicBody1")}</p>
            <p className="body-lg mt-5 max-w-md">{t("about.clinicBody2")}</p>
            <Link
              href="/gallery"
              className="label arrow-forward mt-8 inline-flex items-center gap-3 text-forest"
            >
              {t("about.clinicCta")}
              <span className="arrow">→</span>
            </Link>
          </div>
          <div className="lg:col-span-7 lg:pl-10">
            <div className="grid grid-cols-2 gap-4">
              {[
                "/images/animals/rabbit-white-background.jpg",
                "/images/animals/bird-cockatiel-white.jpg",
                "/images/animals/dog-french-bulldog-white.jpg",
                "/images/animals/kitten-white-background.jpg",
              ].map((src, i) => (
                <Reveal key={src} delay={i * 80} variant="scale">
                  <Image
                    src={src}
                    alt=""
                    width={1024}
                    height={1024}
                    sizes="(max-width: 1024px) 45vw, 25vw"
                    className="h-auto w-full select-none"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* WHY WE CARE */}
      <section className="border-t border-[var(--line)]">
        <div className="shell grid grid-cols-1 items-center gap-8 py-14 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-7">
            <p className="label text-ink/40">{t("about.whyLabel")}</p>
            <h2 className="display d1 mt-6 uppercase">
              {t("home.finalCta.title1")}
              <br />
              <span className="display-serif d1-serif text-moss">{t("home.finalCta.title2")}</span>
              <br />
              {t("home.finalCta.title3")}
            </h2>
            <p className="body-lg mt-8 max-w-lg">{t("about.whyBody")}</p>
          </div>
          <div className="lg:col-span-5">
            <Reveal variant="scale">
              <Image
                src="/images/animals/puppy-white-background.jpg"
                alt="Labrador puppy on a pure white background"
                width={1024}
                height={1024}
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="h-auto w-full select-none"
                style={{ mixBlendMode: "multiply" }}
              />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
