"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/features/auth/actions";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import { CLINIC } from "@/lib/clinic";

type HeaderUser = { fullName: string; role: "user" | "doctor" | "admin" } | null;

export function SiteHeader({
  locale,
  clinicName,
  user,
}: {
  locale: Locale;
  clinicName: string;
  user: HeaderUser;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  // `openFor` stores the pathname the menu was opened on: navigating closes it
  // without needing an effect that resets state.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const close = () => setOpenFor(null);
  const [langOpen, setLangOpen] = useState(false);

  const links = [
    { href: `/${locale}/services`, label: t("nav.services"), index: "01" },
    { href: `/${locale}/doctors`, label: t("nav.doctors"), index: "02" },
    { href: `/${locale}/about`, label: t("nav.about"), index: "03" },
    { href: `/${locale}/journal`, label: t("nav.journal"), index: "04" },
    { href: `/${locale}/reviews`, label: t("nav.reviews"), index: "05" },
    { href: `/${locale}/contact`, label: t("nav.contact"), index: "06" },
  ];

  // Body scroll lock + Escape key while the mobile sheet is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function switchLocale(next: Locale) {
    const segments = pathname.split("/");
    segments[1] = next;
    setLangOpen(false);
    close();
    router.push(segments.join("/") || `/${next}`);
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-canvas">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[100rem] items-center justify-between gap-4 px-5 sm:px-8 lg:gap-6 lg:px-12">
          <Link href={`/${locale}`} className="flex items-baseline gap-3" aria-label={clinicName}>
            <span className="text-[1.05rem] font-medium tracking-[0.32em] text-ink uppercase">
              {CLINIC.name}
            </span>
            <span className="hidden text-[0.6rem] tracking-[0.22em] text-ink-2 uppercase lg:inline">
              {t("nav.tagline")}
            </span>
          </Link>

          <nav aria-label={t("nav.menu")} className="hidden items-center gap-8 lg:flex">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "link-underline text-[0.78rem] tracking-[0.1em] uppercase transition-colors",
                    active ? "text-forest" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setLangOpen((value) => !value)}
                aria-expanded={langOpen}
                aria-haspopup="menu"
                aria-label={t("nav.language")}
                className="flex items-center gap-1.5 px-1 text-[0.72rem] tracking-[0.18em] text-ink-2 uppercase hover:text-ink"
              >
                {LOCALE_LABELS[locale]}
                <span aria-hidden className="text-[0.6rem]">
                  ▾
                </span>
              </button>
              {langOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-8 z-[70] w-28 border border-line bg-canvas py-1 shadow-[0_18px_40px_-30px_rgba(37,37,34,0.5)]"
                >
                  {LOCALES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      role="menuitem"
                      onClick={() => switchLocale(code)}
                      className={cn(
                        "block w-full px-3 py-2 text-left text-[0.72rem] tracking-[0.18em] uppercase hover:bg-canvas-2",
                        code === locale ? "text-forest" : "text-ink-2",
                      )}
                    >
                      {LOCALE_LABELS[code]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="hidden items-center gap-4 md:flex">
                {user.role !== "user" && (
                  <Link
                    href={`/${locale}/admin`}
                    className="link-underline text-[0.72rem] tracking-[0.14em] text-forest uppercase"
                  >
                    {t("nav.admin")}
                  </Link>
                )}
                <Link
                  href={`/${locale}/account`}
                  className="link-underline text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase hover:text-ink"
                >
                  {t("nav.account")}
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase hover:text-ink"
                  >
                    {t("nav.logout")}
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="hidden text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase hover:text-ink md:inline"
              >
                {t("nav.login")}
              </Link>
            )}

            <Link
              href={`/${locale}/book`}
              className="btn btn-primary !px-4 !py-2.5 text-[0.62rem] sm:!px-5 sm:!py-3 sm:text-[0.75rem]"
            >
              {t("nav.book")}
            </Link>

            <button
              type="button"
              onClick={() => (open ? close() : setOpenFor(pathname))}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-line text-ink lg:hidden"
            >
              <span className="sr-only">{open ? t("nav.close") : t("nav.menu")}</span>
              <span aria-hidden className="flex flex-col gap-[5px]">
                <span
                  className={cn(
                    "block h-px w-5 bg-ink transition-transform",
                    open && "translate-y-[6px] rotate-45",
                  )}
                />
                <span className={cn("block h-px w-5 bg-ink transition-opacity", open && "opacity-0")} />
                <span
                  className={cn(
                    "block h-px w-5 bg-ink transition-transform",
                    open && "-translate-y-[6px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/*
        Mobile navigation is rendered OUTSIDE the header on purpose: the header
        must not create a containing block for fixed children (backdrop-filter
        and transforms do), otherwise the sheet collapses to zero height.
      */}
      {open && (
        <div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.menu")}
          className="fixed inset-x-0 top-[4.5rem] bottom-0 z-[60] flex flex-col overflow-y-auto overscroll-contain border-t border-line bg-canvas px-5 py-6 lg:hidden"
          style={{ animation: "fadeIn 0.25s ease both" }}
        >
          <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
            <span className="label-eyebrow">{t("nav.menu")}</span>
            <button
              type="button"
              onClick={close}
              className="flex items-center gap-2 text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase"
            >
              {t("nav.close")}
              <span aria-hidden>✕</span>
            </button>
          </div>

          <nav aria-label={t("nav.menu")} className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="flex items-baseline justify-between border-b border-line py-5 text-2xl tracking-tight text-ink"
              >
                {link.label}
                <span className="section-index">{link.index}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 flex flex-col gap-3">
            <Link href={`/${locale}/book`} onClick={close} className="btn btn-primary w-full">
              {t("nav.book")}
            </Link>
            {user ? (
              <>
                <Link href={`/${locale}/account`} onClick={close} className="btn btn-ghost w-full">
                  {t("nav.account")}
                </Link>
                {user.role !== "user" && (
                  <Link href={`/${locale}/admin`} onClick={close} className="btn btn-quiet w-full">
                    {t("nav.admin")}
                  </Link>
                )}
                <form action={logoutAction}>
                  <button type="submit" className="btn btn-quiet w-full">
                    {t("nav.logout")}
                  </button>
                </form>
              </>
            ) : (
              <Link href={`/${locale}/login`} onClick={close} className="btn btn-ghost w-full">
                {t("nav.login")}
              </Link>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-6">
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => switchLocale(code)}
                className={cn(
                  "border px-4 py-2 text-[0.72rem] tracking-[0.18em] uppercase",
                  code === locale ? "border-forest text-forest" : "border-line text-ink-2",
                )}
              >
                {LOCALE_LABELS[code]}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-1 text-xs text-ink-2">
            <a href={`tel:${CLINIC.phoneLinks[0]}`} className="link-underline w-fit text-ink">
              {CLINIC.phones[0]}
            </a>
            <a href={`tel:${CLINIC.phoneLinks[1]}`} className="link-underline w-fit text-ink">
              {CLINIC.phones[1]}
            </a>
            <span>{CLINIC.addressShort[locale]}</span>
          </div>
        </div>
      )}
    </>
  );
}
