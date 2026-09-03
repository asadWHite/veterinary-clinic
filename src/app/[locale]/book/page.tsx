import type { Metadata } from "next";
import { BookingFlow } from "@/features/booking/BookingFlow";
import { getCurrentUser } from "@/lib/auth";
import { getDoctors, getPets, getServices } from "@/lib/queries";
import { getClinicSettings } from "@/lib/settings";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dictionary = getDictionary(isLocale(raw) ? raw : "uz");
  return {
    title: `${dictionary.meta.book} — ${dictionary.meta.siteTitle}`,
    description: dictionary.booking.lead,
    alternates: { canonical: `/${raw}/book` },
    robots: { index: false, follow: true },
  };
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const query = await searchParams;

  const [services, doctors, user, settings] = await Promise.all([
    getServices(locale),
    getDoctors(locale),
    getCurrentUser(),
    getClinicSettings(),
  ]);
  const pets = user ? await getPets(user.id) : [];

  const serviceParam = typeof query.service === "string" ? query.service : null;
  const doctorParam = typeof query.doctor === "string" ? query.doctor : null;

  const preselectedServiceSlug =
    serviceParam && services.some((service) => service.slug === serviceParam) ? serviceParam : null;
  const preselectedDoctor = doctorParam ? doctors.find((doctor) => doctor.slug === doctorParam) : null;

  return (
    <div className="border-b border-line">
      <BookingFlow
        services={services}
        doctors={doctors}
        pets={pets.map((pet) => ({
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          birthDate: pet.birthDate,
          weightGrams: pet.weightGrams,
          photoUrl: pet.photoUrl,
        }))}
        isAuthenticated={Boolean(user)}
        userId={user?.id ?? null}
        timezone={settings.timezone}
        preselectedServiceSlug={preselectedServiceSlug}
        preselectedDoctorId={preselectedDoctor?.id ?? null}
        clientDefaults={{
          name: user?.fullName ?? "",
          phone: user?.phone ?? "",
          email: user?.email ?? "",
        }}
      />
    </div>
  );
}
