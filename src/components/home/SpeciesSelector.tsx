"use client";

import { useState } from "react";
import Image from "next/image";
import { assetById, speciesMeta, speciesInfo, type SpeciesKey } from "@/data/animals";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/i18n/I18nProvider";
import { pickL } from "@/i18n/localized";

const TABS: SpeciesKey[] = ["dog", "cat", "small"];

export function SpeciesSelector() {
  const [active, setActive] = useState<SpeciesKey>("dog");
  const { t, locale } = useI18n();
  const info = speciesInfo(active, locale);
  const asset = assetById(speciesMeta[active].assetId);

  return (
    <div className="border-t border-[var(--line)]">
      <div className="shell grid grid-cols-1 gap-8 py-10 lg:grid-cols-12 lg:gap-0 lg:py-16">
        {/* Portrait — cross-fades between species */}
        <div className="relative order-2 lg:order-1 lg:col-span-7 lg:pr-12">
          <div className="relative mx-auto aspect-square w-full max-w-[620px]">
            {TABS.map((key) => {
              const a = assetById(speciesMeta[key].assetId);
              const isActive = key === active;
              return (
                <Image
                  key={key}
                  src={a.src}
                  alt={a.alt}
                  width={1024}
                  height={1024}
                  sizes="(max-width: 1024px) 90vw, 55vw"
                  aria-hidden={!isActive}
                  className="absolute inset-0 h-full w-full select-none object-contain transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    mixBlendMode: "multiply",
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "scale(1)" : "scale(0.965)",
                  }}
                />
              );
            })}
          </div>
          <div className="pointer-events-none absolute bottom-2 left-0 hidden lg:block">
            <span className="label text-ink/35">{asset.breed}</span>
          </div>
        </div>

        {/* Selector */}
        <div className="order-1 lg:order-2 lg:col-span-5 lg:border-l lg:border-[var(--line)] lg:pl-12">
          <p className="label text-ink/40">{t("home.species.who")}</p>
          <ul className="mt-6 border-t border-[var(--line)]">
            {TABS.map((key, i) => {
              const meta = speciesMeta[key];
              const isActive = key === active;
              return (
                <li key={key} className="border-b border-[var(--line)]">
                  <button
                    type="button"
                    onMouseEnter={() => setActive(key)}
                    onFocus={() => setActive(key)}
                    onClick={() => setActive(key)}
                    aria-pressed={isActive}
                    className="group flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="label mono-num text-ink/30">0{i + 1}</span>
                      <span
                        className={`display d4 uppercase transition-colors duration-300 ${
                          isActive ? "text-ink" : "text-ink/35"
                        }`}
                      >
                        {speciesInfo(key, locale).label}
                      </span>
                    </span>
                    <span
                      className={`arrow text-xl transition-all duration-500 ${
                        isActive
                          ? "translate-x-0 text-forest opacity-100"
                          : "-translate-x-3 text-ink/30 opacity-40"
                      }`}
                    >
                      →
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 min-h-[9rem]">
            <Reveal key={active} variant="up">
              <p className="body-lg max-w-md">{info.blurb}</p>
              <p className="label mt-4 text-forest">{info.count}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
