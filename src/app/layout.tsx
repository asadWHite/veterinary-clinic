import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getLocale } from "@/i18n/server";
import { locales, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site } from "@/lib/site";
import "./globals.css";

const satoshi = localFont({
  src: [
    { path: "../../src/fonts/satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../../src/fonts/satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../../src/fonts/satoshi-700.woff2", weight: "700", style: "normal" },
    { path: "../../src/fonts/satoshi-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-sans-stack",
  display: "swap",
  fallback: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
});

const editorial = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-editorial-stack",
  display: "swap",
  weight: ["400"],
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const title = `${site.name} — ${dict.hero.srTitle}`;

  return {
    metadataBase: new URL(site.url),
    title: {
      default: title,
      template: `%s · ${site.name}`,
    },
    description: dict.meta.description,
    keywords: [
      "veterinary clinic",
      "veterinarian",
      "pet care",
      "vaccination",
      "diagnostics",
      "dental care",
      "surgery",
    ],
    alternates: {
      canonical: "/",
      languages: Object.fromEntries(
        locales.map((code) => [code, `/?lang=${code}`]),
      ) as Record<string, string>,
    },
    openGraph: {
      type: "website",
      url: site.url,
      siteName: site.name,
      locale,
      title,
      description: dict.meta.description,
      images: [
        { url: "/images/animals/dog-golden-retriever-white.jpg", width: 1024, height: 1024 },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: dict.meta.description,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${satoshi.variable} ${editorial.variable}`}>
      <body className="bg-canvas text-ink antialiased">
        <a
          href="#main"
          className="label sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:bg-forest focus:px-4 focus:py-3 focus:text-white"
        >
          {getDictionary(locale).nav.skip}
        </a>
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}

export const defaultLocaleExport = defaultLocale;
