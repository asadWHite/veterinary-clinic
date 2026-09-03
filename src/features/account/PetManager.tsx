"use client";

import { useActionState, useState } from "react";
import { deletePetAction, savePetAction, type ActionState } from "@/features/account/actions";
import { FormNote, Spinner } from "@/components/ui/Bits";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import type { Pet } from "@/db/schema";

type Draft = {
  id: number | null;
  name: string;
  species: "dog" | "cat" | "other";
  breed: string;
  sex: string;
  birthDate: string;
  weight: string;
  notes: string;
};

function toDraft(pet: Pet | null): Draft {
  return {
    id: pet?.id ?? null,
    name: pet?.name ?? "",
    species: pet?.species ?? "dog",
    breed: pet?.breed ?? "",
    sex: pet?.sex ?? "",
    birthDate: pet?.birthDate ?? "",
    weight: pet?.weightGrams ? String(pet.weightGrams / 1000) : "",
    notes: pet?.notes ?? "",
  };
}

export function PetManager({ pets }: { pets: Pet[] }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [state, action, pending] = useActionState<ActionState, FormData>(savePetAction, {});

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="label-eyebrow">
          {t("account.pets.passport")} · {pets.length}
        </span>
        <button
          type="button"
          onClick={() => setDraft(toDraft(null))}
          className="btn btn-ghost !py-3"
        >
          {t("account.pets.add")}
        </button>
      </div>

      {state.ok && draft === null && <p className="text-sm text-forest">{t("account.pets.saved")}</p>}

      {draft && (
        <form action={action} className="flex flex-col gap-6 border border-line bg-canvas-2/40 p-6 sm:p-8">
          {draft.id && <input type="hidden" name="id" value={draft.id} />}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="label-eyebrow">{t("booking.pet.name")}</span>
              <input
                name="name"
                required
                className="field-input"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </label>
            <div className="flex flex-col gap-2">
              <span className="label-eyebrow">{t("booking.animal.question")}</span>
              <div className="flex gap-2">
                {(["dog", "cat", "other"] as const).map((species) => (
                  <button
                    key={species}
                    type="button"
                    onClick={() => setDraft({ ...draft, species })}
                    aria-pressed={draft.species === species}
                    className={cn(
                      "border px-4 py-2.5 text-sm transition-colors",
                      draft.species === species
                        ? "border-forest text-forest"
                        : "border-line text-ink-2 hover:border-ink/40",
                    )}
                  >
                    {t(`species.${species}`)}
                  </button>
                ))}
              </div>
              <input type="hidden" name="species" value={draft.species} />
            </div>
            <label className="flex flex-col gap-2">
              <span className="label-eyebrow">{t("booking.pet.breed")}</span>
              <input
                name="breed"
                className="field-input"
                value={draft.breed}
                onChange={(event) => setDraft({ ...draft, breed: event.target.value })}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="label-eyebrow">{t("booking.pet.birthDate")}</span>
              <input
                name="birthDate"
                type="date"
                className="field-input"
                value={draft.birthDate}
                onChange={(event) => setDraft({ ...draft, birthDate: event.target.value })}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="label-eyebrow">{t("booking.pet.weight")}</span>
              <input
                name="weight"
                type="number"
                min="0"
                step="0.1"
                className="field-input"
                value={draft.weight}
                onChange={(event) => setDraft({ ...draft, weight: event.target.value })}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="label-eyebrow">{t("booking.pet.sex")}</span>
              <select
                name="sex"
                className="field-input"
                value={draft.sex}
                onChange={(event) => setDraft({ ...draft, sex: event.target.value })}
              >
                <option value="">—</option>
                <option value="male">{t("booking.pet.male")}</option>
                <option value="female">{t("booking.pet.female")}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="label-eyebrow">{t("booking.pet.notes")}</span>
              <textarea
                name="notes"
                rows={3}
                className="field-input resize-none"
                value={draft.notes}
                onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              />
            </label>
          </div>

          {state.error && <FormNote>{t(state.error)}</FormNote>}

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={pending} className="btn btn-primary">
              {pending ? (
                <>
                  <Spinner /> {t("common.saving")}
                </>
              ) : (
                t("common.save")
              )}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="btn btn-quiet">
              {t("common.cancel")}
            </button>
          </div>
        </form>
      )}

      {pets.length === 0 && draft === null ? (
        <div className="flex flex-col items-start gap-3 border border-line px-7 py-10">
          <p className="max-w-md text-lg text-ink">{t("account.pets.empty")}</p>
          <p className="max-w-md text-sm leading-relaxed text-ink-2">{t("account.pets.emptyHint")}</p>
        </div>
      ) : (
        <ul className="flex flex-col">
          {pets.map((pet) => (
            <li
              key={pet.id}
              className="flex flex-col gap-3 border-t border-line py-5 last:border-b sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <span className="text-lg tracking-tight text-ink">{pet.name}</span>
                <span className="text-sm text-ink-2">
                  {t(`species.${pet.species}`)}
                  {pet.breed ? ` · ${pet.breed}` : ""}
                  {pet.birthDate ? ` · ${pet.birthDate}` : ""}
                  {pet.weightGrams ? ` · ${pet.weightGrams / 1000} kg` : ""}
                </span>
                {pet.notes && <span className="max-w-lg text-xs text-ink-2">{pet.notes}</span>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDraft(toDraft(pet))}
                  className="link-underline text-xs text-forest uppercase"
                >
                  {t("account.pets.edit")}
                </button>
                <form action={deletePetAction}>
                  <input type="hidden" name="petId" value={pet.id} />
                  <button type="submit" className="link-underline text-xs text-ink-2 uppercase">
                    {t("account.pets.delete")}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
