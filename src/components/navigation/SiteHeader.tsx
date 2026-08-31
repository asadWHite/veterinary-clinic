"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems, site } from "@/lib/site";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { useSession } from "@/hooks/useSession";
import { useI18n } from "@/i18n/I18nProvider";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const { t } = useI18n();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-canvas/92 backdrop-blur-[6px]">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-3" aria-label={`${site.name} home`}>
          <span className="relative block h-[26px] w-[26px] shrink-0 bg-forest">
            <span className="absolute top-1/2 left-1/2 h-[2px] w-[10px] -translate-x-1/2 -translate-y-1/2 bg-white" />
            <span className="absolute top-1/2 left-1/2 h-[10px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-white" />
          </span>
          <span className="leading-none">
            <span className="block text-[13px] font-bold tracking-[-0.02em] uppercase">
              {site.name}
            </span>
            <span className="label-sm mt-[3px] block text-ink/45">{t("hero.eyebrow")}</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 xl:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`label link-underline press py-1 ${
                  active ? "text-ink" : "text-ink/55 hover:text-ink"
                }`}
              >
                {t(`nav.${item.label}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <Link
            href={user ? "/account" : "/login"}
            className="label hidden py-2 text-ink/55 transition-colors hover:text-ink sm:block"
          >
            {user ? t("nav.account") : t("nav.login")}
          </Link>
          <Link
            href="/booking"
            className="label arrow-forward group flex items-center gap-2 bg-ink px-4 py-3 text-white transition-colors hover:bg-forest sm:px-5"
          >
            <span className="hidden sm:inline">{t("nav.book")}</span>
            <span className="sm:hidden">{t("common.book").split(" ")[0]}</span>
            <span className="arrow text-[11px]">→</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="label ml-1 flex h-11 w-11 items-center justify-center border border-[var(--line)] xl:hidden"
          >
            {open ? t("nav.close") : t("nav.menu")}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-[var(--line)] bg-canvas xl:hidden"
      >
        <nav aria-label="Mobile" className="shell flex flex-col py-2">
          {navItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-baseline justify-between border-b border-[var(--line)] py-4"
              style={{ animation: `heroRise .5s cubic-bezier(.22,1,.36,1) ${i * 40}ms both` }}
            >
              <span className="display d4 text-[7vw]">{t(`nav.${item.label}`)}</span>
              <span className="label mono-num text-ink/35">0{i + 1}</span>
            </Link>
          ))}
          <Link
            href={user ? "/account" : "/login"}
            className="flex items-baseline justify-between border-b border-[var(--line)] py-4"
          >
            <span className="display d4 text-[7vw]">{user ? t("nav.account") : t("nav.login")}</span>
            <span className="label mono-num text-ink/35">08</span>
          </Link>
          <div className="py-6">
            <p className="label mb-3 text-ink/40">{t("nav.language")}</p>
            <div className="max-w-[240px]">
              <LanguageSwitcher variant="stack" />
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-[var(--line)] py-6">
            <a href={site.phoneHref} className="body-lg">
              {site.phone}
            </a>
            <span className="label text-ink/45">{site.hours}</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
