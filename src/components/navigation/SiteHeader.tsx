"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems, site } from "@/lib/site";
import { useSession } from "@/hooks/useSession";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";

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
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-canvas">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} — ${t("nav.home")}`}>
            <span className="relative block h-[24px] w-[24px] shrink-0 bg-forest">
              <span className="absolute top-1/2 left-1/2 h-[2px] w-[9px] -translate-x-1/2 -translate-y-1/2 bg-white" />
              <span className="absolute top-1/2 left-1/2 h-[9px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-white" />
            </span>
            <span className="leading-none">
              <span className="block text-[12.5px] font-bold tracking-[-0.02em] uppercase">
                {site.name}
              </span>
              <span className="label-sm mt-[3px] block text-ink/45">{t("hero.eyebrow")}</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-5 xl:flex">
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
              className="label hidden py-2 text-ink/55 transition-colors hover:text-ink lg:block"
            >
              {user ? t("nav.account") : t("nav.login")}
            </Link>
            <Link
              href="/booking"
              className="label arrow-forward flex items-center gap-2 bg-forest px-3.5 py-3 text-white transition-colors hover:bg-ink sm:px-5"
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
              aria-label={open ? t("nav.close") : t("nav.menu")}
              className="label ml-1 flex h-11 min-w-[52px] items-center justify-center gap-1.5 border border-[var(--line)] xl:hidden"
            >
              {open ? (
                <span aria-hidden="true" className="relative block h-[12px] w-[16px]">
                  <span className="absolute top-1/2 left-0 h-[2px] w-full rotate-45 bg-ink" />
                  <span className="absolute top-1/2 left-0 h-[2px] w-full -rotate-45 bg-ink" />
                </span>
              ) : (
                <span aria-hidden="true" className="block h-[10px] w-[16px]">
                  <span className="absolute block h-[2px] w-[16px] bg-ink" />
                  <span className="mt-[3px] block h-[2px] w-[16px] bg-ink" />
                  <span className="mt-[3px] block h-[2px] w-[11px] bg-ink" />
                </span>
              )}
              <span className="hidden sm:inline">{open ? t("nav.close") : t("nav.menu")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — outside <header> so `fixed` is relative to the viewport
          (backdrop-filter on the header would otherwise trap it). */}
      {open ? (
        <div
          id="mobile-menu"
          className="fixed inset-0 top-16 z-40 flex flex-col bg-canvas xl:hidden"
        >
          <nav aria-label="Mobile" className="hide-scroll flex-1 overflow-y-auto">
            <div className="shell flex flex-col pb-4">
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-3.5"
                  style={{ animation: `heroRise .4s cubic-bezier(.22,1,.36,1) ${i * 30}ms both` }}
                >
                  <span className="display d4">{t(`nav.${item.label}`)}</span>
                  <span className="label mono-num shrink-0 text-ink/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              ))}
              <Link
                href={user ? "/account" : "/login"}
                className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-3.5"
              >
                <span className="display d4">{user ? t("nav.account") : t("nav.login")}</span>
                <span className="label mono-num shrink-0 text-ink/30">08</span>
              </Link>

              <div className="py-5">
                <p className="label mb-3 text-ink/40">{t("nav.language")}</p>
                <LanguageSwitcher variant="stack" />
              </div>

              <div className="flex flex-col gap-2 border-t border-[var(--line)] py-5">
                <a href={site.phoneHref} className="label text-forest">
                  {site.phone}
                </a>
                <span className="caption">{site.hours}</span>
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
