"use client";

import Image from "next/image";
import { useBooking } from "@/components/booking/BookingContext";
import { StageFrame } from "@/components/booking/StageFrame";
import { speciesOptions } from "@/data/booking-options";
import { assetById, speciesMeta } from "@/data/animals";
import { useI18n } from "@/i18n/I18nProvider";
import { pickL } from "@/i18n/localized";

export function AnimalSelector() {
  const { state, setAnswer, next, setPet , t, locale } = useBooking();
  const selected = typeof state.answers.species === "string" ? state.answers.species : null;

  return (
    <StageFrame
      eyebrow={t("booking.companion.eyebrow")}
      title={t("booking.companion.title1") + "\n" + t("booking.companion.title2") + "\n" + t("booking.companion.title3")}
      prompt={t("booking.companion.prompt")}
    >
      <div
        role="radiogroup"
        aria-label="Species"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
      >
        {speciesOptions.map((option) => {
          const isOther = option.value === "other";
          const asset = assetById(speciesMeta[option.value as keyof typeof speciesMeta].assetId);
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                setPet(null, "");
                setAnswer("species", option.value);
              }}
              className={`press group relative flex flex-col border p-3 pb-4 text-left transition-all duration-500 sm:p-4 sm:pb-5 ${
                isSelected
                  ? "border-ink bg-paper"
                  : "border-[var(--line)] hover:border-ink/50"
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden">
                {isOther ? (
                  <div className="dot-grid flex h-full w-full items-center justify-center">
                    <span className="display text-[22vw] leading-none text-ink/[0.09] sm:text-[6vw]">
                      ?
                    </span>
                  </div>
                ) : (
                  <Image
                    src={asset.src}
                    alt={asset.alt}
                    width={1024}
                    height={1024}
                    sizes="(max-width: 640px) 45vw, 20vw"
                    className={`h-full w-full select-none object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isSelected ? "scale-[1.04]" : "group-hover:scale-[1.05]"
                    }`}
                    style={{ mixBlendMode: "multiply" }}
                  />
                )}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="display d5 uppercase">{pickL(option.label, locale)}</span>
                {isSelected ? (
                  <span className="label text-forest">{t("common.selected")}</span>
                ) : (
                  <span className="label text-ink/30">{option.hint ? pickL(option.hint, locale) : ""}</span>
                )}
              </div>
              {isSelected ? (
                <span className="absolute inset-x-0 bottom-0 h-[3px] bg-forest" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={!selected}
          onClick={next}
          className="label arrow-forward flex items-center gap-3 bg-ink px-8 py-5 text-white transition-colors hover:bg-forest disabled:cursor-not-allowed disabled:opacity-30"
        >
          {t("common.continue")}
          <span className="arrow">→</span>
        </button>
        {!selected ? (
          <p className="label text-ink/40">{t("booking.chooseToContinue")}</p>
        ) : null}
      </div>
    </StageFrame>
  );
}
