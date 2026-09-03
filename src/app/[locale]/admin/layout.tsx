import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
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
  if (user.role === "user") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-5 py-24 sm:px-8">
        <span className="section-index">403</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("admin.access.denied")}</h1>
        <p className="max-w-lg text-[0.95rem] leading-relaxed text-ink-2">{t("admin.access.deniedHint")}</p>
        <Link href={`/${locale}`} className="btn btn-primary">
          {t("errors.goHome")}
        </Link>
      </div>
    );
  }

  const links = [
    { href: `/${locale}/admin`, label: t("admin.nav.dashboard") },
    { href: `/${locale}/admin/appointments`, label: t("admin.nav.appointments") },
    { href: `/${locale}/admin/schedule`, label: t("admin.nav.schedule") },
    { href: `/${locale}/admin/reviews`, label: t("admin.nav.reviews") },
    { href: `/${locale}/admin/journal`, label: t("admin.nav.journal") },
    { href: `/${locale}/admin/settings`, label: t("admin.nav.settings") },
  ];

  return (
    <div className="border-b border-line">
      <div className="mx-auto grid w-full max-w-[100rem] grid-cols-1 gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[16rem_1fr] lg:gap-14 lg:px-12 lg:py-16">
        <aside className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="label-eyebrow">{t("admin.title")}</span>
            <span className="text-lg tracking-tight text-ink">{user.fullName}</span>
            {user.role === "doctor" && (
              <span className="text-xs text-ink-2">{t("admin.access.doctorScope")}</span>
            )}
          </div>
          <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-0">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-line px-1 py-2.5 text-sm text-ink-2 transition-colors hover:text-forest"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href={`/${locale}`}
            className="link-underline text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase lg:mt-auto"
          >
            {t("admin.nav.backToSite")}
          </Link>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
