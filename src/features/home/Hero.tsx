import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { createTranslator } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { CLINIC, pick } from "@/lib/clinic";

export function Hero({
  locale,
  serviceCount,
  doctorCount,
  journalCount,
}: {
  locale: Locale;
  serviceCount: number;
  doctorCount: number;
  journalCount: number;
}) {
  const { t } = createTranslator(locale);

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="mx-auto grid w-full max-w-[100rem] grid-cols-1 gap-10 px-5 pt-12 pb-14 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20 lg:pb-24 xl:gap-20">
        {/* ── text column ─────────────────────────────────────────────── */}
        <div className="relative isolate flex flex-col justify-between gap-9">
          {/* White cat, barely visible, behind the headline */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <Image
              src="/images/hero-cat-white.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[68%_28%] opacity-[0.5] lg:opacity-[0.17]"
              style={{ filter: "saturate(0.5) brightness(1.05)" }}
            />
            {/* veils keep the text on a clean canvas and fade the cat in */}
            <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/60 to-canvas/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-canvas/15 via-canvas/40 to-canvas/85" />
            <div className="absolute inset-0 bg-canvas/25 lg:bg-canvas/45" />
          </div>

          <div className="flex flex-col gap-7">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[0.7rem] font-medium tracking-[0.4em] text-forest uppercase">
                {CLINIC.name}
              </span>
              <span className="h-px w-8 bg-line" />
              <span className="text-[0.62rem] tracking-[0.24em] text-ink-2 uppercase">
                {pick(CLINIC.shortLabel, locale)}
              </span>
            </div>

            <Reveal>
              <h1 className="text-display font-normal text-ink">
                {t("home.hero.title")}
                <br />
                <span className="editorial-serif text-forest-2">{t("home.hero.titleAccent")}</span>
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="max-w-xl text-[1.02rem] leading-relaxed text-ink-2">
                {t("home.hero.lead")}
              </p>
            </Reveal>

            <Reveal delay={220} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link href={`/${locale}/book`} className="btn btn-primary w-full sm:w-auto">
                {t("home.hero.primaryCta")}
              </Link>
              <Link href={`/${locale}/services`} className="btn btn-ghost w-full sm:w-auto">
                {t("home.hero.secondaryCta")}
              </Link>
            </Reveal>
          </div>

          <Reveal delay={300}>
            <dl className="grid grid-cols-3 gap-4 border-t border-line pt-7 sm:gap-6">
              <div className="flex flex-col gap-1">
                <dt className="label-eyebrow">{t("nav.services")}</dt>
                <dd className="font-serif text-xl text-ink sm:text-2xl">{serviceCount}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="label-eyebrow">{t("nav.doctors")}</dt>
                <dd className="font-serif text-xl text-ink sm:text-2xl">{doctorCount}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="label-eyebrow">{t("nav.journal")}</dt>
                <dd className="font-serif text-xl text-ink sm:text-2xl">{journalCount}</dd>
              </div>
            </dl>
            <p className="mt-5 max-w-md text-[0.8rem] leading-relaxed text-ink-2 sm:text-sm">
              {t("home.story.pillars.0.title")} · {t("home.story.pillars.1.title")} ·{" "}
              {t("home.story.pillars.2.title")}
            </p>
          </Reveal>
        </div>

        {/* ── image column ────────────────────────────────────────────── */}
        <Reveal delay={100} className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-canvas-2 lg:aspect-auto lg:h-full lg:min-h-[36rem]">
            <Image
              src="/images/hero-puppy.jpg"
              alt={t("home.hero.imageAlt")}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 border border-ink/5" aria-hidden />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-2">
            <span className="editorial-serif max-w-[16rem] text-sm text-forest-2">
              {t("home.story.pillars.1.body")}
            </span>
            <span className="flex flex-col items-start gap-1 text-left sm:items-end sm:text-right">
              <span className="label-eyebrow">{t("contact.address")}</span>
              <span>{pick(CLINIC.addressShort, locale)}</span>
              <a href="tel:+998994064640" className="link-underline text-ink">
                {CLINIC.phones[0]}
              </a>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
