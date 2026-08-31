import { getI18n } from "@/i18n/server";
import { pickL } from "@/i18n/localized";
import Link from "next/link";
import { navItems, site } from "@/lib/site";

export async function SiteFooter() {
  const { t } = await getI18n();
  return (
    <footer className="border-t border-[var(--line)] bg-canvas">
      <div className="shell grid grid-cols-1 gap-10 py-12 md:grid-cols-12 md:py-16">
        <div className="md:col-span-4">
          <div className="flex items-center gap-3">
            <span className="relative block h-[26px] w-[26px] bg-forest">
              <span className="absolute top-1/2 left-1/2 h-[2px] w-[10px] -translate-x-1/2 -translate-y-1/2 bg-white" />
              <span className="absolute top-1/2 left-1/2 h-[10px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-white" />
            </span>
            <span className="text-[13px] font-bold tracking-[-0.02em] uppercase">{site.name}</span>
          </div>
          <p className="label mt-5 max-w-xs leading-[1.9] text-white/50">{t("footer.tagline")}</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-4">
          <p className="label text-ink/35">{t("footer.navigate")}</p>
          <ul className="mt-5 grid grid-cols-2 gap-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline text-sm text-ink/70">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/booking" className="link-underline text-sm text-ink/70">
                {t("nav.book")}
              </Link>
            </li>
            <li>
              <Link href="/account" className="link-underline text-sm text-ink/70">
                {t("nav.account")}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className="label text-ink/35">{t("footer.contact")}</p>
          <ul className="mt-5 space-y-2 text-sm text-ink/70">
            <li>{site.address}</li>
            <li>
              <a href={site.phoneHref} className="link-underline">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="link-underline">
                {site.email}
              </a>
            </li>
            <li className="pt-2 text-ink/45">{site.hours}</li>
          </ul>
          <div className="mt-5 flex gap-5">
            <a href="#" className="label link-underline text-ink/60">
              {t("footer.instagram")}
            </a>
            <a href="#" className="label link-underline text-ink/60">
              {t("footer.telegram")}
            </a>
          </div>
        </div>
      </div>

      <div className="shell flex flex-col gap-3 border-t border-[var(--line)] py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="label text-ink/35">
          © {new Date().getFullYear()} {site.legalName}. {t("footer.rights")}
        </p>
        <div className="flex gap-6">
          <Link href="/privacy" className="label link-underline text-ink/35">
            {t("footer.privacy")}
          </Link>
          <Link href="/terms" className="label link-underline text-ink/35">
            {t("footer.terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
