import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const { t } = createTranslator(locale);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const links = [
    { href: `/${locale}/account`, label: t("account.nav.overview") },
    { href: `/${locale}/account/pets`, label: t("account.nav.pets") },
    { href: `/${locale}/account/appointments`, label: t("account.nav.appointments") },
    { href: `/${locale}/account/reviews`, label: t("account.nav.reviews") },
    { href: `/${locale}/account/favorites`, label: t("account.nav.favorites") },
    { href: `/${locale}/account/settings`, label: t("account.nav.settings") },
  ];

  return (
    <div className="border-b border-line">
      <div className="mx-auto grid w-full max-w-[100rem] grid-cols-1 gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[17rem_1fr] lg:gap-16 lg:px-12 lg:py-20">
        <aside className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="label-eyebrow">{t("account.hello")}</span>
            <span className="text-xl tracking-tight text-ink">{user.fullName}</span>
            <span className="text-xs text-ink-2">
              {t("account.overview.memberSince")}{" "}
              {new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-GB", {
                dateStyle: "medium",
              }).format(new Date())}
            </span>
          </div>
          <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-0">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-line px-1 py-2.5 text-sm text-ink-2 transition-colors hover:text-forest lg:border-b"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="lg:mt-auto">
            <button type="submit" className="link-underline text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase">
              {t("nav.logout")}
            </button>
          </form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
