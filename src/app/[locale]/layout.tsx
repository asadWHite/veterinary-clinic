import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getCurrentUser } from "@/lib/auth";
import { getServices } from "@/lib/queries";
import { getClinicSettings } from "@/lib/settings";
import { CLINIC, clinicNameFor, pick } from "@/lib/clinic";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/client";

export async function generateStaticParams() {
  return [{ locale: "uz" }, { locale: "ru" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const dictionary = getDictionary(locale);
  const settings = await getClinicSettings();
  const clinicName = settings.clinicName ? pick(settings.clinicName, locale) : clinicNameFor(locale);
  const title = dictionary.meta.siteTitle;
  return {
    title,
    description: dictionary.meta.siteDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: { uz: "/uz", ru: "/ru", en: "/en" },
    },
    openGraph: {
      title,
      description: dictionary.meta.siteDescription,
      locale,
      siteName: CLINIC.name,
      type: "website",
      url: `/${locale}`,
      images: ["/images/hero-puppy.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: dictionary.meta.siteDescription,
      images: ["/images/hero-puppy.jpg"],
    },
    icons: { icon: "/favicon.svg" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  const [dictionary, settings, services, user] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getClinicSettings(),
    getServices(locale),
    getCurrentUser(),
  ]);

  const clinicName = settings.clinicName ? pick(settings.clinicName, locale) : clinicNameFor(locale);

  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:border focus:border-forest focus:bg-canvas focus:px-4 focus:py-2 focus:text-xs focus:tracking-[0.14em] focus:uppercase"
      >
        {dictionary.nav.skipToContent}
      </a>
      <SiteHeader
        locale={locale}
        clinicName={clinicName}
        user={user ? { fullName: user.fullName, role: user.role } : null}
      />
      <main id="content">{children}</main>
      <SiteFooter locale={locale} services={services} />
    </I18nProvider>
  );
}
