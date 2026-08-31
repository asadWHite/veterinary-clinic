"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { animalAssets, speciesMeta, type SpeciesKey } from "@/data/animals";
import { speciesOptions } from "@/data/booking-options";
import { useI18n } from "@/i18n/I18nProvider";
import { pickL } from "@/i18n/localized";

export function PetForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    species: "dog" as SpeciesKey,
    breed: "",
    ageStage: "adult",
    birthYear: "",
    weightKg: "",
    sex: "",
    photoAssetId: "puppy",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useI18n();
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="label arrow-forward flex items-center gap-3 bg-ink px-6 py-4 text-white transition-colors hover:bg-forest"
      >
        {t("pets.add")}
        <span className="arrow">→</span>
      </button>
    );
  }

  return (
    <form
      className="hero-rise border border-[var(--line)] p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch("/api/pets", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = (await res.json()) as { error?: string };
        setBusy(false);
        if (!res.ok) {
          setError(data.error ?? "Could not save.");
          return;
        }
        setOpen(false);
        router.refresh();
      }}
    >
      <p className="label text-ink/40">{t("pets.newCompanion")}</p>

      <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
        <div>
          <label htmlFor="pet-name" className="label text-ink/45">
            {t("pets.name")} *
          </label>
          <input
            id="pet-name"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="mt-3 w-full border-b border-ink/25 bg-transparent pb-3 text-lg font-semibold outline-none focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="pet-species" className="label text-ink/45">
            {t("pets.species")}
          </label>
          <select
            id="pet-species"
            value={form.species}
            onChange={(e) => {
              const value = e.target.value as SpeciesKey;
              set("species", value);
              set("photoAssetId", speciesMeta[value].assetId);
            }}
            className="mt-3 w-full border-b border-ink/25 bg-transparent pb-3 text-lg font-semibold outline-none focus:border-ink"
          >
            {speciesOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {pickL(o.label, locale)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pet-breed" className="label text-ink/45">
            {t("pets.breed")}
          </label>
          <input
            id="pet-breed"
            value={form.breed}
            onChange={(e) => set("breed", e.target.value)}
            className="mt-3 w-full border-b border-ink/25 bg-transparent pb-3 text-lg font-semibold outline-none focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="pet-age" className="label text-ink/45">
            {t("pets.lifeStage")}
          </label>
          <select
            id="pet-age"
            value={form.ageStage}
            onChange={(e) => set("ageStage", e.target.value)}
            className="mt-3 w-full border-b border-ink/25 bg-transparent pb-3 text-lg font-semibold outline-none focus:border-ink"
          >
            <option value="baby">{t("ageStage.baby")}</option>
            <option value="young">{t("ageStage.young")}</option>
            <option value="adult">{t("ageStage.adult")}</option>
            <option value="senior">{t("ageStage.senior")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="pet-weight" className="label text-ink/45">
            {t("pets.weight")} ({t("pets.weightUnit")})
          </label>
          <input
            id="pet-weight"
            type="number"
            step="0.1"
            value={form.weightKg}
            onChange={(e) => set("weightKg", e.target.value)}
            className="mt-3 w-full border-b border-ink/25 bg-transparent pb-3 text-lg font-semibold outline-none focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="pet-sex" className="label text-ink/45">
            {t("pets.sex")}
          </label>
          <input
            id="pet-sex"
            value={form.sex}
            onChange={(e) => set("sex", e.target.value)}
            className="mt-3 w-full border-b border-ink/25 bg-transparent pb-3 text-lg font-semibold outline-none focus:border-ink"
          />
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="label text-ink/45">Portrait</legend>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {animalAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => set("photoAssetId", asset.id)}
              aria-pressed={form.photoAssetId === asset.id}
              className={`press border p-1 transition-colors ${
                form.photoAssetId === asset.id ? "border-ink" : "border-transparent hover:border-[var(--line)]"
              }`}
            >
              <Image
                src={asset.src}
                alt=""
                width={128}
                height={128}
                sizes="80px"
                className="aspect-square w-full object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
            </button>
          ))}
        </div>
        <p className="label mt-3 text-ink/30">{t("pets.portraitNote")}</p>
      </fieldset>

      {error ? <p className="label mt-6 text-forest">{error}</p> : null}

      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-6">
        <button
          type="submit"
          disabled={busy}
          className="label bg-ink px-8 py-5 text-white transition-colors hover:bg-forest disabled:opacity-40"
        >
          {busy ? t("common.saving") : t("pets.save")}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="label text-ink/45">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
