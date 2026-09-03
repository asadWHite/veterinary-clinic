import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Manrope, Lora } from "next/font/google";
import { getLocaleFromCookies } from "@/lib/auth";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic", "latin-ext"],
  display: "swap",
  variable: "--font-manrope",
});

const lora = Lora({
  subsets: ["latin", "cyrillic", "latin-ext"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Veterinary clinic — care that begins with understanding",
    template: "%s",
  },
  description:
    "Calm, consistent and clearly explained veterinary care. Online booking, pet passports and real doctor availability.",
  openGraph: {
    type: "website",
    siteName: "Veterinary clinic",
    images: ["/images/hero-puppy.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F8F6F1",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocaleFromCookies();
  return (
    <html lang={locale} className={`${manrope.variable} ${lora.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}


