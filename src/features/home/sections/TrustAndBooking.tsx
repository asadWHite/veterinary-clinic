import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Bits";
import { DoctorCard } from "@/features/doctors/DoctorCard";
import { createTranslator } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { DoctorCard as DoctorCardData, ServiceCard } from "@/lib/types";

export function DoctorsSection({
  locale,
  doctors,
  services,
  favoriteIds,
  canFavorite,
}: {
  locale: Locale;
  doctors: DoctorCardData[];
  services: ServiceCard[];
  favoriteIds: number[];
  canFavorite: boolean;
}) {
  const { t } = createTranslator(locale);
  return (
    <section className="border-b border-line py-20 sm:py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index={t("home.doctors.label")}
            title={t("home.doctors.title")}
            accent={t("home.doctors.titleAccent")}
          />
          <Link href={`/${locale}/doctors`} className="link-underline text-[0.72rem] tracking-[0.16em] text-forest uppercase">
            {t("home.doctors.viewAll")}
          </Link>
        </div>

        <Reveal delay={80}>
          <p className="mt-8 max-w-2xl border-l-2 border-sage pl-5 text-sm leading-relaxed text-ink-2">
            {t("home.doctors.lead")}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doctor, index) => (
            <Reveal key={doctor.slug} delay={index * 80} className="h-full">
              <DoctorCard
                doctor={doctor}
                locale={locale}
                index={index + 1}
                services={services}
                isFavorite={favoriteIds.includes(doctor.id)}
                canFavorite={canFavorite}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEP_KEYS = [
  "animal",
  "pet",
  "age",
  "reason",
  "questions",
  "recommendation",
  "doctor",
  "datetime",
  "client",
  "summary",
] as const;

export function BookingSection({ locale }: { locale: Locale }) {
  const { t } = createTranslator(locale);
  return (
    <section className="relative overflow-hidden bg-forest py-20 text-canvas sm:py-24 lg:py-32">
      <div className="mx-auto grid w-full max-w-[100rem] grid-cols-1 gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-12">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <span className="section-index !text-sage">{t("home.booking.label")}</span>
            <span className="h-px w-12 bg-canvas/20" />
          </div>
          <h2 className="text-h1 font-normal tracking-tight">
            {t("home.booking.title")}
            <br />
            <span className="editorial-serif !text-sage">{t("home.booking.titleAccent")}</span>
          </h2>
          <p className="max-w-xl text-[0.98rem] leading-relaxed text-canvas/70">
            {t("home.booking.lead")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={`/${locale}/book`} className="btn !border-canvas !bg-canvas !text-forest hover:!bg-sage-2">
              {t("home.booking.start")}
            </Link>
            <span className="max-w-xs text-xs leading-relaxed text-canvas/60">
              {t("home.booking.note")}
            </span>
          </div>

          <div className="relative mt-6 hidden aspect-[16/10] w-full overflow-hidden lg:block">
            <Image
              src="/images/dog-adult.jpg"
              alt={t("home.cta.imageAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover opacity-90"
            />
          </div>
        </div>

        <ol className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:gap-x-10">
          {STEP_KEYS.map((key, index) => (
            <li
              key={key}
              className="flex items-baseline gap-4 border-t border-canvas/15 py-4 sm:py-5"
            >
              <span className="font-serif text-sm text-sage">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-base tracking-tight text-canvas/90">{t(`booking.steps.${key}`)}</span>
            </li>
          ))}
          <li className="hidden border-t border-canvas/15 sm:block" />
          <li className="border-t border-canvas/15 sm:hidden" />
        </ol>
      </div>
    </section>
  );
}
