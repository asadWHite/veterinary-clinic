"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { accountNav } from "@/lib/site";
import { useI18n } from "@/i18n/I18nProvider";
import { LogoutButton } from "@/components/account/LogoutButton";

export function AccountNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <aside className="border-b border-[var(--line)] lg:border-b-0 lg:border-r">
      <div className="lg:sticky lg:top-16">
        <p className="label px-[var(--gutter)] pt-8 pb-4 text-ink/40 lg:px-8">{t("account.title")}</p>
        <nav aria-label="Account" className="hide-scroll flex overflow-x-auto lg:flex-col lg:overflow-visible">
          {accountNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`label shrink-0 border-t border-[var(--line)] px-[var(--gutter)] py-4 transition-colors lg:border-t-0 lg:border-b lg:px-8 lg:py-4 ${
                  active ? "bg-ink text-white" : "text-ink/55 hover:bg-paper hover:text-ink"
                }`}
              >
                {t(`account.${item.label}`)}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-8 py-8 lg:block">
          <Link
            href="/booking"
            className="label arrow-forward flex items-center justify-between gap-3 bg-forest px-5 py-4 text-white"
          >
            {t("nav.book")}
            <span className="arrow">→</span>
          </Link>
          <div className="mt-6">
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
