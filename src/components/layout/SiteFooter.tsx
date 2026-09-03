import Link from "next/link";
import { getClinicSettings, clinicContact } from "@/lib/settings";
import { CLINIC, pick } from "@/lib/clinic";
import type { Locale } from "@/lib/i18n/config";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

type FooterService = { slug: string; title: string };

export async function SiteFooter({
  locale,
  services,
}: {
  locale: Locale;
  services: FooterService[];
}) {
  const { t } = createTranslator(locale);
  const settings = await getClinicSettings();
  const contact = clinicContact(settings);
  const mapQuery = encodeURIComponent("ELVET Veterinary Clinic Shoxjahon 4A Tashkent");

  const columns: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
    {
      title: t("footer.navigation"),
      links: [
        { href: `/${locale}/services`, label: t("nav.services") },
        { href: `/${locale}/doctors`, label: t("nav.doctors") },
        { href: `/${locale}/about`, label: t("nav.about") },
        { href: `/${locale}/journal`, label: t("nav.journal") },
        { href: `/${locale}/reviews`, label: t("nav.reviews") },
        { href: `/${locale}/contact`, label: t("nav.contact") },
      ],
    },
    {
      title: t("footer.servicesTitle"),
      links: services.slice(0, 6).map((service) => ({
        href: `/${locale}/services/${service.slug}`,
        label: service.title,
      })),
    },
  ];

  return (
    <footer className="border-t border-line bg-canvas-2">
      <div className="mx-auto w-full max-w-[100rem] px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr]">
          <div className="flex flex-col gap-7">
            <div>
              <p className="text-[1.05rem] font-medium tracking-[0.28em] text-ink uppercase">
                {CLINIC.name}
              </p>
              <p className="mt-2 text-[0.7rem] tracking-[0.2em] text-ink-2 uppercase">
                {pick(CLINIC.shortLabel, locale)}
              </p>
              <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-ink-2">
                {t("footer.tagline")}
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm text-ink-2">
              <span className="label-eyebrow">{t("footer.contact")}</span>
              <span className="flex flex-col gap-1">
                {contact.phones.map((phone, index) => (
                  <a
                    key={phone}
                    href={`tel:${contact.phoneLinks[index]}`}
                    className="link-underline w-fit text-ink hover:text-forest"
                  >
                    {phone}
                  </a>
                ))}
              </span>
              {contact.email && <span>{contact.email}</span>}
              <a
                href={`https://maps.google.com/?q=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline w-fit text-ink-2 hover:text-forest"
              >
                {pick(settings.address, locale)}
              </a>
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline w-fit text-ink-2 hover:text-forest"
              >
                {t("footer.instagram")}: {contact.instagram ?? CLINIC.instagramHandle}
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <span className="label-eyebrow">{column.title}</span>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="link-underline text-sm text-ink-2 hover:text-ink">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex flex-col gap-4">
              <span className="label-eyebrow">{t("footer.hours")}</span>
              <ul className="flex flex-col gap-2 text-sm text-ink-2">
                <li>{pick(CLINIC.hoursWeekdays, locale)}</li>
                <li>{pick(CLINIC.hoursWeekend, locale)}</li>
                <li className="text-ink">
                  {t("footer.lastAppointment")}: {settings.lastAppointment ?? CLINIC.lastAppointment}
                </li>
              </ul>
              <div className="mt-2 flex flex-col gap-2">
                <span className="label-eyebrow">{t("footer.legal")}</span>
                <Link
                  href={`/${locale}/admin`}
                  className="link-underline text-sm text-ink-2 hover:text-ink"
                >
                  {t("nav.admin")}
                </Link>
                <Link
                  href={`/${locale}/legal/privacy`}
                  className="link-underline text-sm text-ink-2 hover:text-ink"
                >
                  {t("footer.privacy")}
                </Link>
                <Link
                  href={`/${locale}/legal/terms`}
                  className="link-underline text-sm text-ink-2 hover:text-ink"
                >
                  {t("footer.terms")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {LOCALES.map((code) => (
              <Link
                key={code}
                href={`/${code}`}
                className="border border-line px-3 py-1.5 text-[0.68rem] tracking-[0.18em] text-ink-2 uppercase hover:border-forest hover:text-forest"
              >
                {LOCALE_LABELS[code]}
              </Link>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-ink-2">
            {CLINIC.name} · {CLINIC.website} · {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
