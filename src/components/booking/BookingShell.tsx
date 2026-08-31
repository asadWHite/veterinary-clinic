"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BookingProvider, useBooking } from "@/components/booking/BookingContext";
import { BookingProgress } from "@/components/booking/BookingProgress";
import { AnimalSelector } from "@/components/booking/AnimalSelector";
import { PetSelector, type PetOption } from "@/components/booking/PetSelector";
import { AgeSelector } from "@/components/booking/AgeSelector";
import { ConcernSelector } from "@/components/booking/ConcernSelector";
import { QuestionnaireEngine } from "@/components/booking/QuestionnaireEngine";
import { RecommendationCard } from "@/components/booking/RecommendationCard";
import { DoctorSelector } from "@/components/booking/DoctorSelector";
import { TimeSelector } from "@/components/booking/TimeSelector";
import { BookingDetails } from "@/components/booking/BookingDetails";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { assetById, speciesMeta, speciesInfo, type SpeciesKey } from "@/data/animals";
import { useI18n } from "@/i18n/I18nProvider";

type ShellProps = {
  doctors: Parameters<typeof BookingProvider>[0]["doctors"];
  user: Parameters<typeof BookingProvider>[0]["user"];
  pets: PetOption[];
  services: { slug: string; name: string; durationMinutes: number; summary: string }[];
  initialDoctorId?: string | null;
};

export function BookingShell({
  doctors,
  user,
  pets,
  services,
  initialDoctorId,
}: ShellProps) {
  return (
    <BookingProvider
      doctors={doctors}
      user={user}
      pets={pets}
      initialDoctorId={initialDoctorId}
    >
      <div className="min-h-screen bg-canvas">
        <BookingTopBar />
        <BookingProgress />
        <BookingLayout services={services} pets={pets} />
      </div>
    </BookingProvider>
  );
}

function BookingTopBar() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-canvas/95 backdrop-blur-[6px]">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link href="/" className="label link-underline text-ink/55 hover:text-ink">
          {t("common.backToSite")}
        </Link>
        <p className="display d5 uppercase">{t("booking.title")}</p>
        <p className="label hidden text-ink/35 sm:block">[CLINIC NAME]</p>
      </div>
    </header>
  );
}

function BookingLayout({
  services,
  pets,
}: {
  services: { slug: string; name: string; durationMinutes: number; summary: string }[];
  pets: PetOption[];
}) {
  const { state , t, locale } = useBooking();
  const stage = state.stage;
  const showCompanion = stage !== "done";
  const species = (typeof state.answers.species === "string" ? state.answers.species : "dog") as SpeciesKey;
  const asset = assetById(speciesMeta[species].assetId);

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-12">
      {/* Persistent companion — the animal never leaves the screen */}
      {showCompanion ? (
        <aside className="hidden border-r border-[var(--line)] lg:col-span-4 lg:block">
          <div className="sticky top-16 flex max-h-[calc(100vh-64px)] flex-col overflow-y-auto px-8 py-8">
            <div className="relative aspect-square w-full">
              <Image
                key={asset.id}
                src={asset.src}
                alt={asset.alt}
                width={1024}
                height={1024}
                sizes="34vw"
                className="h-full w-full select-none object-contain transition-all duration-700"
                style={{ mixBlendMode: "multiply" }}
              />
            </div>
            <div className="mt-6">
              <p className="label text-ink/35">{asset.title}</p>
              <p className="display d4 mt-2 uppercase">
                {state.petName || speciesInfo(species, locale).label}
              </p>
              {state.petBreed ? <p className="label mt-2 text-ink/45">{state.petBreed}</p> : null}
            </div>
            <div className="mt-8">
              <BookingSummary />
            </div>
            <p className="label mt-8 leading-[1.9] text-ink/30">
              {t("booking.summary.privacy")}
            </p>
          </div>
        </aside>
      ) : null}

      <main className="lg:col-span-8">
        {showCompanion ? <BookingSummary compact /> : null}
        <div className="px-[var(--gutter)] py-8 lg:py-14">
          {stage === "companion" ? (
            <>
              <PetSelector pets={pets} />
              <AnimalSelector />
            </>
          ) : null}
          {stage === "age" ? <AgeSelector /> : null}
          {stage === "concern" ? <ConcernSelector /> : null}
          {stage === "context" ? <QuestionnaireEngine /> : null}
          {stage === "care" ? <RecommendationCard services={services} /> : null}
          {stage === "doctor" ? <DoctorSelector /> : null}
          {stage === "time" ? <TimeSelector /> : null}
          {stage === "details" ? <BookingDetails /> : null}
          {stage === "done" ? <BookingConfirmation /> : null}
        </div>
      </main>
    </div>
  );
}

export function BookingShellSpacer() {
  return <span className="hidden" />;
}

export type BookingStageContent = ReactNode;
