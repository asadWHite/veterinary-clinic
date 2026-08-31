import { getI18n } from "@/i18n/server";
import Image from "next/image";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export async function EmergencyBand() {
  const { t } = await getI18n();
  return (
    <section className="bg-forest text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="shell py-9 lg:py-20">
            <p className="label text-white/50">{t("home.emergency.label")}</p>
            <h2 className="display d2 mt-6 uppercase">
              {t("home.emergency.title1")}
              <br />
              {t("home.emergency.title2")}
            </h2>
            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-white/75">
              {t("home.emergency.body")}
            </p>

            <div className="mt-10 grid grid-cols-1 gap-px sm:grid-cols-2">
              <a
                href={site.phoneHref}
                className="label arrow-forward group flex items-center justify-between gap-4 border border-white/25 px-6 py-6 transition-colors hover:bg-white hover:text-forest"
              >
                {t("home.emergency.call")}
                <span className="arrow">→</span>
              </a>
              <a
                href="#"
                className="label arrow-forward group flex items-center justify-between gap-4 border border-white/25 px-6 py-6 transition-colors hover:bg-white hover:text-forest"
              >
                {t("home.emergency.directions")}
                <span className="arrow">→</span>
              </a>
            </div>

            <p className="label mt-8 text-white/40">{t("home.emergency.note")}</p>
          </div>
        </div>

        <div className="flex items-end justify-center bg-white lg:col-span-5">
          <Reveal variant="scale" className="w-full">
            <Image
              src="/images/animals/kitten-white-background.jpg"
              alt="Kitten looking directly at the camera on a pure white background"
              width={1024}
              height={1024}
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="h-auto w-full max-w-[440px] select-none"
              style={{ mixBlendMode: "multiply" }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
