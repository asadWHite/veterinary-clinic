import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClinicSettings, settingText } from "@/lib/settings";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const SLUGS = ["privacy", "terms"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t } = createTranslator(locale);
  const title = slug === "privacy" ? t("footer.privacy") : t("footer.terms");
  return { title, alternates: { canonical: `/${locale}/legal/${slug}` } };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  if (!(SLUGS as readonly string[]).includes(slug)) notFound();
  const { t } = createTranslator(locale);
  const settings = await getClinicSettings();
  const placeholder = t("common.notConfigured");

  const title = slug === "privacy" ? t("footer.privacy") : t("footer.terms");

  return (
    <div className="border-b border-line">
      <section className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 lg:py-24">
        <Link
          href={`/${locale}`}
          className="link-underline text-[0.72rem] tracking-[0.14em] text-ink-2 uppercase"
        >
          ← {t("meta.home")}
        </Link>
        <h1 className="mt-10 text-h1 font-normal tracking-tight text-ink">{title}</h1>

        <div className="mt-10 flex flex-col gap-5 text-[0.98rem] leading-[1.8] text-ink-2">
          <p>{t("footer.configurableNote")}</p>
          <p>{t("booking.summary.consent")}</p>
          <dl className="mt-4 flex flex-col gap-3 border-t border-line pt-6 text-sm">
            <div className="flex items-baseline justify-between gap-6 border-b border-line pb-3">
              <dt className="label-eyebrow">{t("footer.phone")}</dt>
              <dd>{settingText(settings.phone, locale, placeholder)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-line pb-3">
              <dt className="label-eyebrow">{t("footer.email")}</dt>
              <dd>{settingText(settings.email, locale, placeholder)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-line pb-3">
              <dt className="label-eyebrow">{t("footer.address")}</dt>
              <dd>{settingText(settings.address, locale, placeholder)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
