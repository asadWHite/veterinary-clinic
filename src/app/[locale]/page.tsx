import type { Metadata } from "next";
import { Hero } from "@/features/home/Hero";
import { PhilosophySection, ServicesSection } from "@/features/home/sections/ServicesAndCare";
import { BookingSection, DoctorsSection } from "@/features/home/sections/TrustAndBooking";
import {
  CtaSection,
  JournalSection,
  ReviewsSection,
  StorySection,
} from "@/features/home/sections/StoryAndVoice";
import { getCurrentUser } from "@/lib/auth";
import {
  getApprovedReviews,
  getDoctors,
  getFavoriteDoctorIds,
  getJournalPosts,
  getServices,
} from "@/lib/queries";
import { getClinicSettings } from "@/lib/settings";
import { CLINIC } from "@/lib/clinic";
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
    title: dictionary.meta.siteTitle,
    description: dictionary.meta.siteDescription,
    alternates: { canonical: `/${locale}` },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t } = createTranslator(locale);

  const [services, doctors, posts, reviews, user, settings] = await Promise.all([
    getServices(locale),
    getDoctors(locale),
    getJournalPosts(locale, 4),
    getApprovedReviews(8),
    getCurrentUser(),
    getClinicSettings(),
  ]);
  const favoriteIds = user ? await getFavoriteDoctorIds(user.id) : [];

  const totalReviews = reviews.length;
  const average =
    totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : null;

  const base = process.env.SITE_URL ?? "https://elvet.uz";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VeterinaryCare",
    name: "ELVET Veterinary Clinic",
    alternateName: "Ветеринарная клиника ELVET",
    description: t("meta.siteDescription"),
    url: `${base}/${locale}`,
    image: `${base}/images/hero-puppy.jpg`,
    medicalSpecialty: "Veterinary",
    telephone: settings.phone ?? CLINIC.phones[0],
    priceRange: "$$",
    currenciesAccepted: "UZS",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shoxjahon 4A, Yakkasaroy",
      addressLocality: "Tashkent",
      addressCountry: "UZ",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "11:00",
        closes: "19:00",
      },
    ],
    sameAs: [CLINIC.instagramUrl],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Structured data only contains configured clinic values.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Hero
        locale={locale}
        serviceCount={services.length}
        doctorCount={doctors.length}
        journalCount={posts.length}
      />
      <ServicesSection locale={locale} services={services} />
      <PhilosophySection locale={locale} />
      <DoctorsSection
        locale={locale}
        doctors={doctors}
        services={services}
        favoriteIds={favoriteIds}
        canFavorite={Boolean(user)}
      />
      <BookingSection locale={locale} />
      <StorySection locale={locale} />
      <JournalSection locale={locale} posts={posts} />
      <ReviewsSection locale={locale} reviews={reviews} average={average} total={totalReviews} />
      <CtaSection locale={locale} />
    </>
  );
}
