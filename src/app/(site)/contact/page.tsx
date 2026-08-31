import { getI18n } from "@/i18n/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Address, phone, email and opening hours. Placeholder details pending launch.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { t } = await getI18n();
  return (
    <>
      <section className="shell grid grid-cols-1 gap-8 py-14 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-7">
          <p className="label text-ink/40">{t("nav.contact")}</p>
          <h1 className="display d1 mt-6 uppercase">
            {t("contact.title1")}
            <br />
            <span className="display-serif d1-serif text-moss">{t("contact.title2")}</span>
          </h1>
        </div>
        <div className="lg:col-span-5 lg:pt-24">
          <p className="body-lg max-w-md">{t("contact.intro")}</p>
        </div>
      </section>

      <section className="border-t border-[var(--line)]">
        <div className="shell grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <dl className="divide-y divide-[var(--line)]">
              {[
                { l: "Address", v: site.address },
                { l: "City", v: site.city },
                { l: t("contact.phone"), v: site.phone, href: site.phoneHref },
                { l: t("contact.email"), v: site.email, href: `mailto:${site.email}` },
                { l: "Hours", v: site.hours },
                { l: t("contact.instagram"), v: site.instagram, href: "#" },
                { l: t("contact.telegram"), v: site.telegram, href: "#" },
              ].map((row) => (
                <div
                  key={row.l}
                  className="flex flex-wrap items-baseline justify-between gap-4 py-6"
                >
                  <dt className="label text-ink/40">{row.l}</dt>
                  <dd className="display d5 uppercase">
                    {row.href ? (
                      <a href={row.href} className="link-underline">
                        {row.v}
                      </a>
                    ) : (
                      row.v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="label mt-8 leading-[1.9] text-ink/35">{t("contact.note")}</p>
          </div>

          <div className="flex items-end justify-center lg:col-span-5 lg:border-l lg:border-[var(--line)] lg:pl-10">
            <Image
              src="/images/animals/dog-golden-retriever-white.jpg"
              alt="Golden retriever on a pure white background"
              width={1024}
              height={1024}
              sizes="(max-width: 1024px) 90vw, 35vw"
              className="h-auto w-full max-w-[420px] select-none"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-paper">
        <div className="shell grid grid-cols-1 gap-4 py-10 sm:grid-cols-2">
          <Link
            href="/booking"
            className="label arrow-forward flex items-center justify-between gap-6 bg-ink px-8 py-6 text-white"
          >
            <span className="display d5 uppercase">{t("common.book")}</span>
            <span className="arrow text-2xl">→</span>
          </Link>
          <a
            href={site.phoneHref}
            className="label arrow-forward flex items-center justify-between gap-6 border border-[var(--line)] px-8 py-6 hover:border-ink"
          >
            <span className="display d5 uppercase">{t("common.callClinic")}</span>
            <span className="arrow text-2xl">→</span>
          </a>
        </div>
      </section>
    </>
  );
}
