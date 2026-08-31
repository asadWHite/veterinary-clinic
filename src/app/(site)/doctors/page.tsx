import type { Metadata } from "next";
import Link from "next/link";
import { DoctorPortrait } from "@/components/doctors/DoctorPortrait";
import { FavoriteToggle } from "@/components/doctors/FavoriteToggle";
import { Reveal } from "@/components/ui/Reveal";
import { getDoctorsWithAvailability } from "@/lib/clinic";
import { shortDateL } from "@/lib/format";
import { specialtyOf } from "@/data/doctors";
import { getI18n } from "@/i18n/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clinicians",
  description: "Meet the clinicians, their specialisms and their next available appointment.",
  alternates: { canonical: "/doctors" },
};

export default async function DoctorsPage() {
  const [{ t, locale }, doctors, user] = await Promise.all([
    getI18n(),
    getDoctorsWithAvailability(30),
    getSessionUser(),
  ]);

  return (
    <>
      <section className="shell grid grid-cols-1 gap-8 py-14 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-7">
          <p className="label text-ink/40">{t("nav.doctors")}</p>
          <h1 className="display d1 mt-6 uppercase">
            {t("doctorsPage.title1")}
            <br />
            <span className="text-forest">{t("doctorsPage.title2")}</span>
          </h1>
        </div>
        <div className="lg:col-span-5 lg:pt-24">
          <p className="body-lg max-w-md">{t("doctorsPage.intro")}</p>
          <p className="label mt-6 leading-[1.9] text-ink/35">{t("doctorsPage.note")}</p>
        </div>
      </section>

      <div className="shell border-t border-[var(--line)] bg-paper">
        <ul className="vdivide">
          {doctors.map((doctor, i) => (
            <li key={doctor.id} className="py-8 lg:py-16">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <Reveal variant="scale">
                    <DoctorPortrait doctor={doctor} className="aspect-[4/5] w-full" />
                  </Reveal>
                </div>
                <div className="lg:col-span-8 lg:pl-10">
                  <p className="label mono-num text-ink/30">
                    {String(i + 1).padStart(2, "0")} — {doctor.code}
                  </p>
                  <h2 className="display d2 mt-4 uppercase">{doctor.name}</h2>
                  <p className="display d5 mt-3 text-forest uppercase">{specialtyOf(doctor.slug, locale)}</p>
                  <p className="body-lg mt-6 max-w-xl">{doctor.bio}</p>

                  <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-[var(--line)] pt-6 sm:grid-cols-4">
                    <div>
                      <dt className="label text-ink/40">{t("doctorsPage.role")}</dt>
                      <dd className="mt-2 text-sm font-semibold">{doctor.role}</dd>
                    </div>
                    <div>
                      <dt className="label text-ink/40">{t("doctorsPage.nextAvailable")}</dt>
                      <dd className="mono-num mt-2 text-sm font-bold">
                        {doctor.next ? `${doctor.next.time} · ${shortDateL(doctor.next.date, locale)}` : t("notAvailable")}
                      </dd>
                    </div>
                    <div>
                      <dt className="label text-ink/40">{t("doctorsPage.sees")}</dt>
                      <dd className="mt-2 text-sm font-semibold capitalize">
                        {doctor.speciesFocus.map((sp) => t(`species.${sp}`)).join(", ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="label text-ink/40">{t("doctorsPage.languages")}</dt>
                      <dd className="mt-2 text-sm font-semibold">
                        {doctor.languages.join(", ")}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href={`/booking?doctor=${doctor.slug}`}
                      className="label arrow-forward flex items-center gap-3 bg-ink px-8 py-5 text-white transition-colors hover:bg-forest"
                    >
                      {t("doctorsPage.bookWith")}
                      <span className="arrow">→</span>
                    </Link>
                    {user ? <FavoriteToggle doctorId={doctor.id} /> : null}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
