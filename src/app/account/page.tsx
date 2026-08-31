import { getI18n } from "@/i18n/server";
import { ageLabelL, longDateL, durationLabelL } from "@/lib/format";
import { pickL } from "@/i18n/localized";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getPetsForUser, getUpcomingForUser } from "@/lib/clinic";
import { assetById, speciesInfo, speciesMeta, type SpeciesKey } from "@/data/animals";


export const metadata: Metadata = { title: "Overview" };

export default async function AccountPage() {
  const [{ t, locale }, user] = await Promise.all([getI18n(), getSessionUser()]);
  if (!user) return null;

  const [upcoming, pets] = await Promise.all([
    getUpcomingForUser(user.id),
    getPetsForUser(user.id),
  ]);
  const next = upcoming[0];

  return (
    <div className="px-[var(--gutter)] py-10 lg:py-14">
      <p className="label text-ink/40">{t("account.overview")}</p>
      <h1 className="display d2 mt-5 uppercase">
        {t("account.greeting1")}
        <br />
        {t("account.greeting2")}
      </h1>

      {next ? (
        <section className="mt-12 border-t border-[var(--line)] pt-8">
          <p className="label text-ink/40">{t("account.nextVisit")}</p>
          <div className="mt-6 grid grid-cols-1 gap-8 border border-[var(--line)] p-6 sm:grid-cols-12">
            <div className="sm:col-span-4">
              <Image
                src={assetById(speciesInfo((next.species as SpeciesKey) ?? "dog", locale).assetId).src}
                alt=""
                width={512}
                height={512}
                sizes="200px"
                className="h-auto w-full max-w-[190px] select-none"
                style={{ mixBlendMode: "multiply" }}
              />
            </div>
            <div className="sm:col-span-8">
              <p className="display d4 uppercase">{next.petName}</p>
              <p className="label mt-2 text-forest">{next.serviceName}</p>
              <dl className="mt-6 space-y-3">
                {[
                  { l: t("booking.summary.clinician"), v: next.doctorName },
                  { l: t("booking.summary.date"), v: longDateL(next.date, locale) },
                  { l: t("booking.summary.time"), v: `${next.startTime} · ${durationLabelL(next.durationMinutes, locale)}` },
                  { l: t("account.status"), v: next.status },
                ].map((row) => (
                  <div
                    key={row.l}
                    className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-2"
                  >
                    <dt className="label text-ink/40">{row.l}</dt>
                    <dd className="text-sm font-semibold">{row.v}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href={`/appointments/${next.publicId}`}
                className="label arrow-forward mt-6 inline-flex items-center gap-3 text-forest"
              >
                {t("common.view")}
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-14 border-t border-[var(--line)] pt-8">
        <div className="flex items-end justify-between gap-4">
          <p className="label text-ink/40">{t("account.yourCompanions")}</p>
          <Link href="/pets" className="label link-underline text-forest">
            {t("account.managePets")}
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className="mt-6 border border-[var(--line)] p-10 text-center">
            <p className="display d5 uppercase">{t("account.noCompanions")}</p>
            <p className="body-lg mt-3">{t("account.noCompanionsBody")}</p>
            <Link
              href="/pets"
              className="label arrow-forward mt-6 inline-flex items-center gap-3 bg-ink px-6 py-4 text-white"
            >
              {t("account.addCompanion")}
              <span className="arrow">→</span>
            </Link>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
            {pets.map((pet) => {
              const species = (pet.species as SpeciesKey) ?? "dog";
              const asset = assetById(pet.photoAssetId ?? speciesMeta[species].assetId);
              return (
                <li key={pet.id}>
                  <Link href={`/pets/${pet.id}`} className="group block">
                    <Image
                      src={asset.src}
                      alt=""
                      width={512}
                      height={512}
                      sizes="(max-width: 640px) 45vw, 25vw"
                      className="h-auto w-full select-none transition-transform duration-700 group-hover:scale-[1.03]"
                      style={{ mixBlendMode: "multiply" }}
                    />
                    <div className="mt-3 border-t border-[var(--line)] pt-3">
                      <p className="display d5 uppercase">{pet.name}</p>
                      <p className="label mt-2 text-ink/45">
                        {pet.breed ?? speciesInfo(species, locale).label}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-14 grid grid-cols-1 gap-8 border-t border-[var(--line)] pt-8 sm:grid-cols-3">
        <div>
          <p className="label text-ink/40">{t("account.vaccinationReminders")}</p>
          <p className="display d5 mt-3 uppercase">{t("common.comingSoon")}</p>
          <p className="mt-2 text-sm text-ink/55">
            Reminders appear once a vaccination record is added to a companion profile.
          </p>
        </div>
        <div>
          <p className="label text-ink/40">{t("account.documents")}</p>
          <p className="display d5 mt-3 uppercase">{t("common.nothingYet")}</p>
          <p className="mt-2 text-sm text-ink/55">
            Summaries and results will be stored here after each visit.
          </p>
        </div>
        <div>
          <p className="label text-ink/40">{t("account.contactOnFile")}</p>
          <p className="mt-3 text-sm font-semibold">{user.email}</p>
          <p className="mt-1 text-sm text-ink/55">{user.phone ?? "[PHONE]"}</p>
          <Link href="/account/settings" className="label link-underline mt-3 inline-block text-forest">
            {t("account.updateDetails")}
          </Link>
        </div>
      </section>

      <p className="label mt-14 border-t border-[var(--line)] pt-6 text-ink/30">
        {t("pets.age")}: {pets.length > 0 ? ageLabelL(pets[0].birthYear, locale) : t("notAvailable")}
      </p>
    </div>
  );
}
