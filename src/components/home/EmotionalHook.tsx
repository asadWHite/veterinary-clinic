"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Scroll-linked portrait: the animal rises slightly slower than the page,
 * so the type and the image separate as you move through the section.
 */
export function EmotionalHook() {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const { t, dict } = useI18n();
  const items = dict.home.emotional.items;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const progress = 1 - rect.top / window.innerHeight;
        setOffset(Math.max(-1, Math.min(1, progress)) * 34);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden border-t border-[var(--line)]">
      <div className="shell grid grid-cols-1 gap-y-6 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-8">
          <p className="label text-ink/40">{t("home.emotional.label")}</p>
          <h2 className="mt-8">
            <span
              className="hero-clip display d2 block text-ink"
              style={{ animationDelay: "60ms" }}
            >
              {t("home.emotional.line1")}
            </span>
            <span
              className="hero-clip display d2 block pl-[8%] text-transparent"
              style={{ animationDelay: "180ms", WebkitTextStroke: "1px rgba(16,19,17,0.32)" }}
            >
              {t("home.emotional.line2")}
            </span>
            <span
              className="hero-clip display d2 block pl-[16%] text-ink"
              style={{ animationDelay: "300ms" }}
            >
              {t("home.emotional.line3")}
            </span>
          </h2>
        </div>

        <div className="flex items-end lg:col-span-4 lg:pl-10">
          <p className="display d4 text-forest">{t("home.emotional.response")}</p>
        </div>
      </div>

      {/* mobile: the cat sits in flow, below the type */}
      <div className="shell lg:hidden">
        <Image
          src="/images/animals/cat-british-shorthair-white.jpg"
          alt="British shorthair cat on a pure white background"
          width={1024}
          height={1024}
          sizes="90vw"
          className="h-auto w-full max-w-[320px] select-none"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>

      {/* desktop: the cat sits inside the composition */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] items-center justify-center lg:flex"
        style={{ transform: `translate3d(0, ${offset}px, 0)` }}
      >
        <Image
          src="/images/animals/cat-british-shorthair-white.jpg"
          alt=""
          width={1024}
          height={1024}
          sizes="(max-width: 1024px) 60vw, 38vw"
          className="h-[min(78vh,720px)] w-auto select-none object-contain opacity-[0.9]"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>

      <div className="shell relative z-10 grid grid-cols-1 gap-8 border-t border-[var(--line)] py-10 md:grid-cols-3">
        {items.map((item, i) => (
          <div key={item.k} className="max-w-sm">
            <p className="label mono-num text-ink/30">0{i + 1}</p>
            <p className="display d5 mt-3 uppercase">{item.k}</p>
            <p className="body-lg mt-3 text-[0.95rem]">{item.v}</p>
          </div>
        ))}
      </div>

      <div className="shell relative z-10 border-t border-[var(--line)] py-8">
        <Link
          href="/booking"
          className="label arrow-forward inline-flex items-center gap-3 text-forest"
        >
          {t("home.emotional.cta")}
          <span className="arrow">→</span>
        </Link>
      </div>
    </section>
  );
}
