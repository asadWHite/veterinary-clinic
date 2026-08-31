"use client";

import Image from "next/image";
import { useBooking } from "@/components/booking/BookingContext";
import { assetById, speciesMeta, speciesInfo, type SpeciesKey } from "@/data/animals";
import { pickL } from "@/i18n/localized";

export type PetOption = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  ageStage: string | null;
  photoAssetId: string | null;
};

/** Saved companions appear before species selection for signed-in owners. */
export function PetSelector({ pets }: { pets: PetOption[] }) {
  const { state, setPet, setAnswer, next , t, locale } = useBooking();
  if (pets.length === 0) return null;

  const active = state.petId;

  return (
    <div className="mb-12 border-t border-[var(--line)] pt-8">
      <p className="label text-ink/40">{t("booking.yourCompanions")}</p>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {pets.map((pet) => {
          const species = (pet.species as SpeciesKey) ?? "dog";
          const asset = assetById(pet.photoAssetId ?? speciesMeta[species].assetId);
          const isSelected = active === pet.id;
          return (
            <li key={pet.id}>
              <button
                type="button"
                onClick={() => {
                  setPet(pet.id, pet.name, pet.breed ?? "");
                  setAnswer("species", pet.species);
                }}
                aria-pressed={isSelected}
                className={`press flex w-full items-center gap-3 border p-3 text-left transition-colors ${
                  isSelected ? "border-ink bg-paper" : "border-[var(--line)] hover:border-ink/50"
                }`}
              >
                <span className="relative h-14 w-14 shrink-0">
                  <Image
                    src={asset.src}
                    alt=""
                    width={256}
                    height={256}
                    sizes="56px"
                    className="h-full w-full object-contain"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </span>
                <span className="min-w-0">
                  <span className="display d5 block truncate uppercase">{pet.name}</span>
                  <span className="label mt-1 block truncate text-ink/45">
                    {pet.breed ?? speciesInfo(species, locale).label}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {active ? (
        <button
          type="button"
          onClick={next}
          className="label arrow-forward mt-6 flex items-center gap-3 border border-[var(--line)] px-6 py-4 hover:border-ink"
        >
          Continue with {state.petName}
          <span className="arrow">→</span>
        </button>
      ) : null}
    </div>
  );
}
