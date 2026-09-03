import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResetForm } from "@/features/auth/AuthForms";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const translator = createTranslator(isLocale(raw) ? raw : "uz");
  return { title: `${translator.t("auth.reset")} — ${translator.t("meta.siteTitle")}`, robots: { index: false } };
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const { t } = createTranslator(locale);
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";

  return (
    <div className="border-b border-line">
      <div className="mx-auto grid w-full max-w-[100rem] grid-cols-1 gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:px-12 lg:py-24">
        <div className="flex flex-col gap-6">
          <span className="label-eyebrow">{t("auth.reset")}</span>
          <h1 className="text-h1 font-normal tracking-tight text-ink">{t("auth.reset")}</h1>
          <p className="max-w-md text-[0.98rem] leading-relaxed text-ink-2">{t("auth.resetLead")}</p>
        </div>
        <div className="border border-line bg-canvas-2/40 p-6 sm:p-10">
          {token ? (
            <ResetForm locale={locale} token={token} />
          ) : (
            <p className="text-sm text-ink-2">{t("auth.errors.token")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
