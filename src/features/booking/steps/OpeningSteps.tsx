"use client";

import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import { ageFromBirthDate, lifeStageFromBirthDate } from "@/lib/format";
import type { BookingState, LifeStage, ReasonKey, Species } from "@/lib/types";
import { SPECIES_IMAGES, type PetOption } from "@/features/booking/state";

export type StepApi = {
  state: BookingState;
  set: (patch: Partial<BookingState>) => void;
  go: (step: BookingState["step"]) => void;
};

const SPECIES: Species[] = ["dog", "cat", "other"];
const LIFE_STAGES: { value: LifeStage; labelKey: string; noteKey: string }[] = [
  { value: "baby", labelKey: "booking.age.baby", noteKey: "booking.age.babyNote" },
  { value: "young", labelKey: "booking.age.young", noteKey: "booking.age.youngNote" },
  { value: "adult", labelKey: "booking.age.adult", noteKey: "booking.age.adultNote" },
  { value: "senior", labelKey: "booking.age.senior", noteKey: "booking.age.seniorNote" },
];

const REASONS: ReasonKey[] = [
  "checkup",
  "vaccination",
  "something_wrong",
  "injury",
  "skin",
  "dental",
  "nutrition",
  "surgery",
  "other",
];

export function AnimalSelector({ state, set, go }: StepApi) {
  const { t } = useI18n();
  return (
    <div className="step-enter grid grid-cols-1 gap-5 sm:grid-cols-3">
      {SPECIES.map((species) => {
        const active = state.species === species;
        return (
          <button
            key={species}
            type="button"
            onClick={() => {
              set({
                species,
                pet: state.pet ? { ...state.pet, species } : null,
              });
              go("pet");
            }}
            aria-pressed={active}
            className={cn(
              "group flex flex-col border bg-canvas text-left transition-colors",
              active ? "border-forest" : "border-line hover:border-ink/40",
            )}
          >
            <span className="relative block aspect-[4/3] w-full overflow-hidden bg-canvas-2">
              <Image
                src={SPECIES_IMAGES[species]}
                alt={t(`booking.animal.${species}`)}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </span>
            <span className="flex flex-1 flex-col gap-1.5 p-5">
              <span className="text-xl tracking-tight text-ink">{t(`booking.animal.${species}`)}</span>
              <span className="text-sm leading-relaxed text-ink-2">
                {t(`booking.animal.${species}Note`)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function PetSelector({
  state,
  set,
  go,
  pets,
  isAuthenticated,
}: StepApi & { pets: PetOption[]; isAuthenticated: boolean }) {
  const { t, locale } = useI18n();
  const [adding, setAdding] = useState(pets.length === 0);
  const [draft, setDraft] = useState({
    name: state.pet?.name ?? "",
    breed: state.pet?.breed ?? "",
    birthDate: state.pet?.birthDate ?? "",
    weight: state.pet?.weight ?? "",
    sex: state.pet?.sex ?? "",
  });

  const relevantPets = pets.filter((pet) => pet.species === state.species);
  const otherPets = pets.filter((pet) => pet.species !== state.species);

  function choosePet(pet: PetOption) {
    set({
      pet: {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed ?? "",
        birthDate: pet.birthDate ?? "",
        weight: pet.weightGrams ? String(pet.weightGrams / 1000) : "",
        sex: "",
        notes: "",
      },
      lifeStage: pet.birthDate ? lifeStageFromBirthDate(pet.birthDate) : state.lifeStage,
    });
    go("age");
  }

  function submitDraft() {
    set({
      pet: {
        id: null,
        name: draft.name.trim(),
        species: state.species,
        breed: draft.breed.trim(),
        birthDate: draft.birthDate,
        weight: draft.weight,
        sex: draft.sex,
        notes: "",
      },
      lifeStage: draft.birthDate ? lifeStageFromBirthDate(draft.birthDate) : state.lifeStage,
    });
    go("age");
  }

  return (
    <div className="step-enter flex flex-col gap-8">
      {isAuthenticated && relevantPets.length > 0 && !adding && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relevantPets.map((pet) => (
            <button
              key={pet.id}
              type="button"
              onClick={() => choosePet(pet)}
              className="group flex items-center gap-4 border border-line p-4 text-left transition-colors hover:border-forest"
            >
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-canvas-2 font-serif text-xl text-forest-2">
                {pet.photoUrl ? (
                  <Image src={pet.photoUrl} alt={pet.name} fill sizes="64px" className="object-cover" />
                ) : (
                  pet.name.slice(0, 1).toUpperCase()
                )}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-lg tracking-tight text-ink">{pet.name}</span>
                <span className="text-xs text-ink-2">
                  {t(`species.${pet.species}`)}
                  {pet.breed ? ` · ${pet.breed}` : ""}
                </span>
                <span className="text-xs text-ink-2">
                  {pet.birthDate ? ageFromBirthDate(pet.birthDate, locale) : t("account.pets.unknown")}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {isAuthenticated && !adding && (
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => setAdding(true)} className="btn btn-ghost">
            {t("booking.pet.addNew")}
          </button>
          <button
            type="button"
            onClick={() => {
              set({ pet: { id: null, name: "", species: state.species, breed: "", birthDate: "", weight: "", sex: "", notes: "" } });
              go("age");
            }}
            className="link-underline text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase"
          >
            {t("booking.pet.guest")}
          </button>
        </div>
      )}

      {otherPets.length > 0 && !adding && (
        <p className="text-sm text-ink-2">
          {otherPets.map((pet) => pet.name).join(" · ")} — {t(`species.${otherPets[0].species}`)}
        </p>
      )}

      {(!isAuthenticated || adding) && (
        <div className="flex flex-col gap-6 border border-line bg-canvas-2/50 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="label-eyebrow">{t("booking.pet.name")}</span>
              <input
                className="field-input"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder={t("booking.pet.namePlaceholder")}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="label-eyebrow">{t("booking.pet.breed")}</span>
              <input
                className="field-input"
                value={draft.breed}
                onChange={(event) => setDraft({ ...draft, breed: event.target.value })}
                placeholder={t("booking.pet.breedPlaceholder")}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="label-eyebrow">{t("booking.pet.birthDate")}</span>
              <input
                type="date"
                className="field-input"
                value={draft.birthDate}
                onChange={(event) => setDraft({ ...draft, birthDate: event.target.value })}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="label-eyebrow">{t("booking.pet.weight")}</span>
              <input
                type="number"
                min="0"
                step="0.1"
                className="field-input"
                value={draft.weight}
                onChange={(event) => setDraft({ ...draft, weight: event.target.value })}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <span className="label-eyebrow">{t("booking.pet.sex")}</span>
            <div className="flex gap-3">
              {[
                { value: "male", label: t("booking.pet.male") },
                { value: "female", label: t("booking.pet.female") },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDraft({ ...draft, sex: option.value })}
                  aria-pressed={draft.sex === option.value}
                  className={cn(
                    "border px-5 py-2.5 text-sm transition-colors",
                    draft.sex === option.value
                      ? "border-forest text-forest"
                      : "border-line text-ink-2 hover:border-ink/40",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={submitDraft} className="btn btn-primary">
              {t("booking.questions.continue")}
            </button>
            {isAuthenticated && (
              <button type="button" onClick={() => setAdding(false)} className="btn btn-quiet">
                {t("common.back")}
              </button>
            )}
            {!isAuthenticated && (
              <p className="max-w-xs text-xs leading-relaxed text-ink-2">{t("booking.pet.guestNote")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AgeSelector({ state, set, go }: StepApi) {
  const { t } = useI18n();
  return (
    <div className="step-enter grid grid-cols-1 gap-4 sm:grid-cols-2">
      {LIFE_STAGES.map((stage) => {
        const active = state.lifeStage === stage.value;
        return (
          <button
            key={stage.value}
            type="button"
            onClick={() => {
              set({ lifeStage: stage.value });
              go("reason");
            }}
            aria-pressed={active}
            className={cn(
              "flex flex-col gap-2 border p-6 text-left transition-colors sm:p-8",
              active ? "border-forest bg-canvas-2/60" : "border-line hover:border-ink/40",
            )}
          >
            <span className="text-xl tracking-tight text-ink sm:text-2xl">{t(stage.labelKey)}</span>
            <span className="text-sm leading-relaxed text-ink-2">{t(stage.noteKey)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ReasonSelector({ state, set, go }: StepApi) {
  const { t } = useI18n();
  return (
    <div className="step-enter flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REASONS.map((reason, index) => {
          const active = state.reason === reason;
          return (
            <button
              key={reason}
              type="button"
              onClick={() => {
                set({ reason });
                go("questions");
              }}
              aria-pressed={active}
              className={cn(
                "flex items-baseline justify-between gap-3 border px-5 py-5 text-left transition-colors",
                active ? "border-forest bg-canvas-2/60" : "border-line hover:border-ink/40",
              )}
            >
              <span className="text-base tracking-tight text-ink sm:text-lg">{t(`reasons.${reason}`)}</span>
              <span className="section-index">{String(index + 1).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>
      <p className="max-w-lg text-sm leading-relaxed text-ink-2">{t("booking.reason.hint")}</p>
      {state.reason && (
        <p className="text-xs text-ink-2">
          {t("common.youAreHere")}: {t(`reasons.${state.reason}`)}
        </p>
      )}
    </div>
  );
}


