import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Bits";
import { createTranslator } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { ServiceCard } from "@/lib/types";

export function ServiceRow({
  index,
  service,
  locale,
}: {
  index: number;
  service: ServiceCard;
  locale: Locale;
}) {
  const { t } = createTranslator(locale);
  return (
    <Link
      href={`/${locale}/book?service=${service.slug}`}
      className="group grid grid-cols-1 border-t border-line py-6 transition-colors hover:bg-canvas-2 sm:grid-cols-[3.5rem_1.4fr_1fr_auto] sm:items-center sm:gap-6 sm:py-7"
    >
      <span className="section-index mb-2 sm:mb-0">{String(index).padStart(2, "0")}</span>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xl leading-tight tracking-tight text-ink transition-transform duration-500 group-hover:translate-x-1 sm:text-2xl">
          {service.title}
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-ink-2">{service.summary}</p>
      </div>
      <div className="mt-3 flex flex-col gap-1 text-xs text-ink-2 sm:mt-0">
        <span className="label-eyebrow">{t("home.services.duration")}</span>
        <span className="text-sm text-ink">{service.durationMinutes} {t("common.minutes")}</span>
      </div>
      <span className="mt-4 inline-flex items-center gap-2 text-[0.7rem] tracking-[0.16em] text-forest uppercase sm:mt-0">
        {t("home.services.book")}
        <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}

export function ServicesSection({
  locale,
  services,
}: {
  locale: Locale;
  services: ServiceCard[];
}) {
  const { t } = createTranslator(locale);
  return (
    <section className="border-b border-line py-20 sm:py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index={t("home.services.label")}
            title={t("home.services.title")}
            accent={t("home.services.titleAccent")}
            lead={t("home.services.lead")}
          />
          <Link href={`/${locale}/services`} className="link-underline text-[0.72rem] tracking-[0.16em] text-forest uppercase">
            {t("home.services.viewAll")}
          </Link>
        </div>

        <div className="mt-14 border-b border-line">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={index * 60}>
              <ServiceRow index={index + 1} service={service} locale={locale} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PhilosophySection({ locale }: { locale: Locale }) {
  const { t } = createTranslator(locale);
  const items = [0, 1, 2];
  return (
    <section className="border-b border-line bg-canvas-2/60 py-20 sm:py-24 lg:py-32">
      <div className="mx-auto grid w-full max-w-[100rem] grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-12">
        <div className="flex flex-col gap-8">
          <SectionHeading
            index={t("home.philosophy.label")}
            title={t("home.philosophy.title")}
            accent={t("home.philosophy.titleAccent")}
            lead={t("home.philosophy.lead")}
          />
          <Reveal delay={120}>
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas">
              <Image
                src="/images/vet-hands-puppy.jpg"
                alt={t("home.story.pillars.1.title")}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col justify-center">
          {items.map((index) => (
            <Reveal key={index} delay={index * 90}>
              <div className="grid grid-cols-[3.5rem_1fr] gap-5 border-t border-line py-7 sm:gap-8 sm:py-9">
                <span className="section-index">{String(index + 1).padStart(2, "0")}</span>
                <div className="flex flex-col gap-3">
                  <h3 className="text-2xl tracking-tight text-ink sm:text-3xl">
                    {t(`home.philosophy.items.${index}.title`)}
                  </h3>
                  <p className="max-w-lg text-[0.95rem] leading-relaxed text-ink-2">
                    {t(`home.philosophy.items.${index}.body`)}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-line" />
        </div>
      </div>
    </section>
  );
}
