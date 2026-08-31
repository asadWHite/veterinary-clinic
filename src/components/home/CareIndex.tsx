"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { careItems } from "@/data/care";
import { assetById } from "@/data/animals";
import { useI18n } from "@/i18n/I18nProvider";
import { pickL } from "@/i18n/localized";

export function CareIndex() {
  const [active, setActive] = useState(0);
  const { t, locale } = useI18n();
  const item = careItems[active];
  const asset = assetById(item.assetId);

  return (
    <div className="grid grid-cols-1 border-t border-[var(--line)] lg:grid-cols-12">
      {/* Editorial list */}
      <div className="lg:col-span-7">
        <ul className="shell vdivide">
          {careItems.map((care, i) => {
            const isActive = i === active;
            return (
              <li key={care.index} className="border-b border-[var(--line)] last:border-b-0">
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-expanded={isActive}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left lg:py-8"
                >
                  <span className="flex items-baseline gap-5 lg:gap-8">
                    <span className="label mono-num text-ink/35">{care.index}</span>
                    <span
                      className={`display d4 uppercase transition-all duration-500 ${
                        isActive ? "translate-x-2 text-ink" : "text-ink/40"
                      }`}
                    >
                      {pickL(care.title, locale)}
                    </span>
                  </span>
                  <span
                    className={`arrow text-xl transition-all duration-500 ${
                      isActive
                        ? "translate-x-0 text-forest opacity-100"
                        : "-translate-x-3 text-ink/25 opacity-50"
                    }`}
                  >
                    →
                  </span>
                </button>

                {/* expanding detail — always open on mobile for the active row */}
                <div
                  className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ gridTemplateRows: isActive ? "1fr" : "0fr", opacity: isActive ? 1 : 0 }}
                >
                  <div className="min-h-0">
                    <div className="pb-7 lg:flex lg:gap-12 lg:pr-12">
                      <div className="relative mb-5 aspect-square w-32 shrink-0 lg:hidden">
                        <Image
                          src={assetById(care.assetId).src}
                          alt=""
                          width={512}
                          height={512}
                          sizes="128px"
                          className="h-full w-full object-contain"
                          style={{ mixBlendMode: "multiply" }}
                        />
                      </div>
                      <div className="max-w-xl">
                        <p className="body-lg">{pickL(care.detail, locale)}</p>
                        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                          {care.points.map((p) => (
                            <li key={pickL(p, locale)} className="label flex items-center gap-2 text-ink/55">
                              <span className="block h-1 w-1 bg-forest" />
                              {pickL(p, locale)}
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={`/care#${care.serviceSlug}`}
                          className="label arrow-forward mt-6 inline-flex items-center gap-2 text-forest"
                        >
                          {t("home.species.cta")} {pickL(care.title, locale)}
                          <span className="arrow">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sticky portrait */}
      <div className="relative hidden border-l border-[var(--line)] lg:col-span-5 lg:block">
        <div className="sticky top-16 flex h-[calc(100vh-64px)] flex-col justify-between">
          <div className="relative flex-1 overflow-hidden">
            {careItems.map((care, i) => {
              const a = assetById(care.assetId);
              const isActive = i === active;
              return (
                <Image
                  key={care.assetId}
                  src={a.src}
                  alt={a.alt}
                  width={1024}
                  height={1024}
                  sizes="40vw"
                  aria-hidden={!isActive}
                  className="absolute inset-0 h-full w-full select-none object-contain p-6 transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    mixBlendMode: "multiply",
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "scale(1)" : "scale(0.97)",
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-end justify-between border-t border-[var(--line)] px-6 py-5">
            <div>
              <p className="label text-ink/35">{asset.title}</p>
              <p className="display d5 mt-2 uppercase">{pickL(item.title, locale)}</p>
            </div>
            <span className="display d3 mono-num text-ink/15">{item.index}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
