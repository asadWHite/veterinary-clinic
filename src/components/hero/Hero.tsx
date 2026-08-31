"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { heroAsset } from "@/data/animals";
import { useI18n } from "@/i18n/I18nProvider";

export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const render = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      stage.style.setProperty("--mx", cx.toFixed(4));
      stage.style.setProperty("--my", cy.toFixed(4));
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={stageRef}
      aria-label="Introduction"
      className="relative flex min-h-[calc(100svh-64px)] flex-col overflow-hidden"
      style={{ ["--mx" as string]: 0, ["--my" as string]: 0 }}
    >
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="tilt-grid h-full w-full opacity-60" />
      </div>

      {/* corner labels */}
      <div className="shell relative z-30 flex shrink-0 items-start justify-between pt-8 pb-6 lg:pt-10">
        <div
          className="hero-rise label max-w-[9rem] leading-[1.9] text-ink/60"
          style={{ animationDelay: "120ms" }}
        >
          {t("hero.eyebrow")}
          <br />
          <span className="text-ink/35">{t("hero.eyebrowSub")}</span>
        </div>
        <div
          className="hero-rise label hidden text-right leading-[1.9] text-ink/45 md:block"
          style={{ animationDelay: "220ms" }}
        >
          [CITY]
          <br />
          [WORKING HOURS]
        </div>
      </div>

      {/* ---- poster composition: the animal sits inside the typography ---- */}
      <div className="relative z-20 flex flex-1 flex-col items-stretch justify-end">
        {/* line 1 — solid, above and clear of the animal */}
        <p
          aria-hidden="true"
          className="hero-clip display d1 relative z-20 m-0 text-ink"
          style={{
            animationDelay: "80ms",
            transform: "translate3d(calc(var(--mx) * 3px), calc(var(--my) * 2px), 0)",
            paddingLeft: "var(--gutter)",
          }}
        >
          {t("hero.line1")}
        </p>

        {/* line 2 — outlined, runs behind the animal */}
        <p
          aria-hidden="true"
          className="hero-clip display d1 relative z-0 m-0 whitespace-nowrap text-transparent"
          style={{
            animationDelay: "260ms",
            WebkitTextStroke: "1px rgba(16,19,17,0.30)",
            paddingLeft: "calc(var(--gutter) + 4vw)",
          }}
        >
          {t("hero.line2")}
        </p>

        {/* the animal — no card, no frame, just the subject on white */}
        <div className="relative z-10 flex flex-1 items-end justify-center">
          <div
            className="hero-image relative w-[min(86vw,520px)] lg:w-[min(44vw,620px)]"
            style={{ transform: "translate3d(calc(var(--mx) * -6px), calc(var(--my) * -5px), 0)" }}
          >
            <Image
              src={heroAsset.src}
              alt={heroAsset.alt}
              width={1024}
              height={1024}
              priority
              sizes="(max-width: 1024px) 86vw, 44vw"
              className="h-auto w-full select-none"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>

          {/* line 3 — crosses over the animal's lower body */}
          <p
            aria-hidden="true"
            className="hero-clip display d1 absolute right-[var(--gutter)] bottom-0 z-20 m-0 text-ink"
            style={{
              animationDelay: "380ms",
              transform: "translate3d(calc(var(--mx) * 5px), calc(var(--my) * 3px), 0)",
            }}
          >
            {t("hero.line3").replace(".", "")}<span className="text-forest">.</span>
          </p>
        </div>
      </div>

      <h1 className="sr-only">{t("hero.srTitle")}</h1>

      {/* vertical information block */}
      <div className="pointer-events-none absolute top-1/2 right-[var(--gutter)] z-30 hidden -translate-y-1/2 lg:block">
        <ul className="space-y-4 text-right">
          {[t("hero.focus1"), t("hero.focus2"), t("hero.focus3")].map((item, i) => (
            <li
              key={item}
              className="hero-rise label flex items-center justify-end gap-3 text-ink/55"
              style={{ animationDelay: `${420 + i * 90}ms` }}
            >
              <span className="block h-px w-8 bg-[var(--line-strong)]" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* action bar */}
      <div
        className={`relative z-30 mt-6 shrink-0 border-t border-[var(--line)] transition-opacity duration-700 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="shell grid hdivide-lg grid-cols-2 items-stretch divide-[var(--line)]">
          <Link
            href="/booking"
            className="arrow-forward group flex items-center justify-between gap-4 py-6 pr-4 text-left lg:py-7"
          >
            <span className="display d5 uppercase">{t("hero.book")}</span>
            <span className="arrow text-2xl leading-none">→</span>
          </Link>
          <Link
            href="/doctors"
            className="arrow-forward group flex items-center justify-between gap-4 border-t border-[var(--line)] py-6 pl-4 text-left lg:border-t-0 lg:py-7"
          >
            <span className="display d5 uppercase">{t("hero.meetTeam")}</span>
            <span className="arrow text-2xl leading-none">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
