import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState, SectionHeading } from "@/components/ui/Bits";
import { ServiceRow } from "@/features/home/sections/ServicesAndCare";
import { getServices } from "@/lib/queries";
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
    title: `${dictionary.meta.services} — ${dictionary.meta.siteTitle}`,
    description: dictionary.services.lead,
    alternates: { canonical: `/${raw}/services` },
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const { t } = createTranslator(locale);
  const services = await getServices(locale);

  return (
    <div className="border-b border-line">
      <section className="mx-auto w-full max-w-[100rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <SectionHeading
  as="h1"
          index={`01 / ${t("services.label")}`}
          title={t("services.title")}
          lead={t("services.lead")}
        />
        <div className="mt-14 border-b border-line">
          {services.length === 0 ? (
            <EmptyState title={t("errors.dbUnavailable")} />
          ) : (
            services.map((service, index) => (
              <Reveal key={service.slug} delay={index * 50}>
                <ServiceRow index={index + 1} service={service} locale={locale} />
              </Reveal>
            ))
          )}
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink-2">
          {t("home.services.lead")}{" "}
          <Link href={`/${locale}/book`} className="link-underline text-forest">
            {t("nav.book")}
          </Link>
        </p>
      </section>
    </div>
  );
}
