import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/Bits";
import { getClinicSettings, clinicContact } from "@/lib/settings";
import { CLINIC, pick } from "@/lib/clinic";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const dictionary = getDictionary(locale);
  return {
    title: `${dictionary.contact.title} — ${dictionary.meta.siteTitle}`,
    description: `${dictionary.contact.lead} ${pick(CLINIC.address, locale)}. ${pick(CLINIC.hours, locale)}.`,
    alternates: { canonical: `/${locale}/contact` },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const { t } = createTranslator(locale);
  const settings = await getClinicSettings();
  const contact = clinicContact(settings);

  const mapQuery = encodeURIComponent("ELVET Veterinary Clinic Shoxjahon 4A Tashkent");
  const rows = [
    {
      label: t("contact.address"),
      value: `${pick(settings.address, locale)}${settings.lastAppointment ? "" : ""}`,
      href: `https://maps.google.com/?q=${mapQuery}`,
      linkLabel: t("contact.openMap"),
    },
    {
      label: t("contact.phones"),
      value: contact.phones.join(" · "),
      href: `tel:${contact.phoneLinks[0] ?? ""}`,
      linkLabel: t("contact.callNow"),
    },
    {
      label: t("contact.hours"),
      value: `${pick(settings.hours, locale)}`,
      href: `/${locale}/book`,
      linkLabel: t("contact.bookOnline"),
    },
    {
      label: t("contact.lastAppointment"),
      value: settings.lastAppointment ?? CLINIC.lastAppointment,
      href: contact.instagramUrl,
      linkLabel: `Instagram ${contact.instagram ?? CLINIC.instagramHandle}`,
    },
  ];

  return (
    <div className="border-b border-line">
      <section className="mx-auto w-full max-w-[100rem] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-10">
            <SectionHeading
  as="h1"
              index={`01 / ${t("contact.label")}`}
              title={t("contact.title")}
              lead={t("contact.lead")}
            />

            <dl className="flex flex-col">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-2 border-t border-line py-6 last:border-b sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <dt className="label-eyebrow">{row.label}</dt>
                  <dd className="flex flex-col items-start gap-2 sm:items-end sm:text-right">
                    <span className="text-lg leading-snug tracking-tight text-ink">{row.value}</span>
                    <a
                      href={row.href}
                      className="link-underline text-[0.7rem] tracking-[0.14em] text-forest uppercase"
                    >
                      {row.linkLabel} →
                    </a>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-4">
              <span className="label-eyebrow">{t("contact.urgent")}</span>
              <div className="flex flex-col gap-3 border-l-2 border-clay bg-clay/5 px-5 py-5">
                <p className="max-w-lg text-sm leading-relaxed text-ink">{t("contact.urgentNote")}</p>
                <div className="flex flex-wrap gap-3">
                  {contact.phones.map((phone, index) => (
                    <a
                      key={phone}
                      href={`tel:${contact.phoneLinks[index]}`}
                      className="btn btn-primary !py-3"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-canvas-2">
              <Image
                src="/images/hero-puppy.jpg"
                alt={t("home.hero.imageAlt")}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-3 border border-line bg-canvas-2/50 p-6">
              <span className="label-eyebrow">{t("contact.instagram")}</span>
              <a
                href={contact.instagramUrl}
                className="link-underline text-xl tracking-tight text-ink"
                rel="noopener noreferrer"
                target="_blank"
              >
                {contact.instagram ?? CLINIC.instagramHandle}
              </a>
              <p className="text-sm leading-relaxed text-ink-2">{t("contact.followUs")} · {CLINIC.website}</p>
            </div>
            <Link href={`/${locale}/book`} className="btn btn-ghost">
              {t("nav.book")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
