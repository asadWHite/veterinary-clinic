"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { pickL } from "@/i18n/localized";
import { serviceBySlug } from "@/data/services";
import { useBooking } from "@/components/booking/BookingContext";
import { urgencyMeta } from "@/data/recommendations";
import { durationLabelL } from "@/lib/format";

export function RecommendationCard({
  services,
}: {
  services: { slug: string; name: string; durationMinutes: number; summary: string }[];
}) {
  const { state, recommendation, setField, next, back , t, locale } = useBooking();
  const [choosing, setChoosing] = useState(false);
  const activeSlug = state.serviceSlug ?? recommendation.serviceSlug;
  const active =
    services.find((s) => s.slug === activeSlug) ?? {
      slug: recommendation.serviceSlug,
      name: recommendation.serviceName,
      durationMinutes: recommendation.durationMinutes,
      summary: recommendation.headline,
    };
  const meta = urgencyMeta[recommendation.urgency];
  const localizedServices = services.map((s) => ({
    ...s,
    name: pickL(serviceBySlug(s.slug).name, locale),
  }));

  return (
    <div className="hero-rise">
      <p className="label text-ink/40">{t("booking.care.eyebrow")}</p>
      <h1 className="display d3 mt-5 uppercase">
        {t("booking.care.title1")}
        <br />
        {t("booking.care.title2")}
      </h1>

      {recommendation.urgency === "urgent" ? (
        <div className="mt-8 border-l-2 border-forest bg-forest/[0.05] p-5">
          <p className="label text-forest">{t("booking.care.promptAttention")}</p>
          <p className="body-lg mt-2">{recommendation.safety}</p>
        </div>
      ) : null}

      <div className="mt-10 border-t border-[var(--line)] pt-8">
        <p className="label text-ink/40">{t("booking.care.recommended")}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
          <h2 className="display d4 max-w-xl uppercase">{active.name}</h2>
          <span className="label mono-num border border-[var(--line)] px-3 py-2">
            {durationLabelL(active.durationMinutes, locale)}
          </span>
        </div>

        <p className="body-lg mt-6 max-w-2xl">{recommendation.reason}</p>

        {recommendation.evidence.length > 0 ? (
          <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {recommendation.evidence.map((line) => (
              <li key={line} className="label flex items-start gap-2 text-ink/55">
                <span className="mt-[5px] block h-1 w-1 shrink-0 bg-forest" />
                {line}
              </li>
            ))}
          </ul>
        ) : null}

        {recommendation.safety && recommendation.urgency !== "urgent" ? (
          <p className="mt-8 border-t border-[var(--line)] pt-5 text-sm leading-relaxed text-ink/60">
            {recommendation.safety}
          </p>
        ) : null}

        <p className="label mt-8 text-ink/35">{t("booking.care.noDiagnosis")}</p>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => setChoosing((v) => !v)}
          aria-expanded={choosing}
          className="label link-underline text-forest"
        >
          {choosing ? t("booking.care.close") : t("booking.care.change")}
        </button>

        {choosing ? (
          <div className="hero-rise mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {localizedServices.map((service) => (
              <button
                key={service.slug}
                type="button"
                onClick={() => {
                  setField("serviceSlug", service.slug);
                  setChoosing(false);
                }}
                className={`press border p-4 text-left transition-colors ${
                  service.slug === activeSlug
                    ? "border-ink bg-paper"
                    : "border-[var(--line)] hover:border-ink/50"
                }`}
              >
                <span className="display d5 block uppercase">{pickL(serviceBySlug(service.slug).name, locale)}</span>
                <span className="label mt-2 block text-ink/45">
                  {durationLabelL(service.durationMinutes, locale)}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-8">
        <button type="button" onClick={back} className="label px-2 py-4 text-ink/50 hover:text-ink">
          {t("common.back")}
        </button>
        <span className="label text-ink/40">{t(meta.labelKey)} · {t(meta.noteKey)}</span>
        <button
          type="button"
          onClick={next}
          className="label arrow-forward ml-auto flex items-center gap-3 bg-ink px-8 py-5 text-white transition-colors hover:bg-forest"
        >
          {t("booking.care.chooseClinician")}
          <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
}
