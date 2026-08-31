import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getPetsForUser } from "@/lib/clinic";
import { PetForm } from "@/components/pets/PetForm";
import { assetById, speciesInfo, speciesMeta, type SpeciesKey } from "@/data/animals";
import { ageLabelL } from "@/lib/format";
import { getI18n } from "@/i18n/server";
import { pickL } from "@/i18n/localized";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your companions" };

export default async function PetsPage() {
  const [{ t, locale }, user] = await Promise.all([getI18n(), getSessionUser()]);
  if (!user) return null;
  const pets = await getPetsForUser(user.id);

  return (
    <div className="px-[var(--gutter)] py-10 lg:py-14">
      <p className="label text-ink/40">{t("nav.pets")}</p>
      <h1 className="display d2 mt-5 uppercase">
        {t("pets.title1")}
        <br />
        <span className="display-serif d2-serif text-moss">{t("pets.title2")}</span>
      </h1>

      <div className="mt-10">
        <PetForm />
      </div>

      {pets.length > 0 ? (
        <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 border-t border-[var(--line)] pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => {
            const species = (pet.species as SpeciesKey) ?? "dog";
            const asset = assetById(pet.photoAssetId ?? speciesMeta[species].assetId);
            return (
              <li key={pet.id}>
                <Link href={`/pets/${pet.id}`} className="group block">
                  <Image
                    src={asset.src}
                    alt=""
                    width={1024}
                    height={1024}
                    sizes="(max-width: 640px) 90vw, 30vw"
                    className="h-auto w-full select-none transition-transform duration-700 group-hover:scale-[1.03]"
                    style={{ mixBlendMode: "multiply" }}
                  />
                  <div className="mt-4 border-t border-[var(--line)] pt-4">
                    <p className="display d4 uppercase">{pet.name}</p>
                    <dl className="mt-3 space-y-1">
                      <Row label={t("pets.species")} value={t(`species.${species}`)} />
                      <Row label={t("pets.breed")} value={pet.breed ?? t("notAvailable")} />
                      <Row label={t("pets.age")} value={ageLabelL(pet.birthYear, locale)} />
                      <Row label={t("pets.weight")} value={pet.weightKg ? `${pet.weightKg} ${t("pets.weightUnit")}` : t("notAvailable")} />
                    </dl>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="label text-ink/40">{label}</dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  );
}
