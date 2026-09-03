import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { LoginForm } from "@/features/auth/AuthForms";
import { getCurrentUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dictionary = createTranslator(isLocale(raw) ? raw : "uz");
  return { title: `${dictionary.t("auth.login")} — ${dictionary.t("meta.siteTitle")}`, robots: { index: false } };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const { t } = createTranslator(locale);
  const user = await getCurrentUser();
  if (user) redirect(`/${locale}/account`);

  return (
    <div className="border-b border-line">
      <div className="mx-auto grid w-full max-w-[100rem] grid-cols-1 gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:px-12 lg:py-24">
        <div className="flex flex-col gap-6">
          <span className="label-eyebrow">{t("nav.account")}</span>
          <h1 className="text-h1 font-normal tracking-tight text-ink">{t("auth.login")}</h1>
          <p className="max-w-md text-[0.98rem] leading-relaxed text-ink-2">{t("auth.loginLead")}</p>
          <Link href={`/${locale}/book`} className="link-underline text-[0.72rem] tracking-[0.14em] text-forest uppercase">
            {t("booking.title")} →
          </Link>
        </div>
        <div className="border border-line bg-canvas-2/40 p-6 sm:p-10">
          <LoginForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
