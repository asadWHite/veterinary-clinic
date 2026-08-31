import Link from "next/link";
import { DoctorPortrait } from "@/components/doctors/DoctorPortrait";
import { Reveal } from "@/components/ui/Reveal";
import { getDoctorsWithAvailability } from "@/lib/clinic";
import { shortDateL } from "@/lib/format";
import { specialtyOf } from "@/data/doctors";
import { getI18n } from "@/i18n/server";

export async function DoctorsPreview() {
  const [{ t, locale }, doctors] = await Promise.all([
    getI18n(),
    getDoctorsWithAvailability(30),
  ]);

  return (
    <div className="border-t border-[var(--line)]">
      <div className="shell grid grid-cols-1 gap-8 py-12 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-5">
          <p className="label text-ink/40">{t("home.doctors.label")}</p>
          <h2 className="display d3 mt-6 uppercase">
            {t("home.doctors.title1")}
            <br />
            {t("home.doctors.title2")}
          </h2>
          <p className="body-lg mt-6 max-w-sm">{t("home.doctors.note")}</p>
          <Link
            href="/doctors"
            className="label arrow-forward mt-8 inline-flex items-center gap-3 border border-[var(--line)] px-5 py-4 text-ink hover:border-ink"
          >
            {t("home.doctors.all")}
            <span className="arrow">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:col-span-7 lg:grid-cols-2 lg:gap-x-8">
          {doctors.map((doctor, i) => (
            <Reveal key={doctor.id} delay={i * 90} className="group">
              <Link href={`/booking?doctor=${doctor.slug}`} className="block">
                <div className="overflow-hidden">
                  <DoctorPortrait
                    doctor={doctor}
                    className="aspect-[4/5] w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3 border-t border-[var(--line)] pt-3">
                  <div>
                    <p className="label text-ink/35">{t("home.doctors.code")} {doctor.code}</p>
                    <p className="display d5 mt-2 uppercase">{doctor.name}</p>
                    <p className="mt-2 text-[0.8rem] leading-snug text-ink/55">
                      {specialtyOf(doctor.slug, locale)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="label text-ink/35">{t("home.doctors.nextAvailable")}</p>
                    <p className="mono-num mt-2 text-sm font-bold">
                      {doctor.next ? doctor.next.time : "—"}
                    </p>
                    <p className="label text-ink/35">
                      {doctor.next ? shortDateL(doctor.next.date, locale) : t("home.doctors.full")}
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
