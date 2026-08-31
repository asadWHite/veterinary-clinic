"use client";

import { localeShort, locales, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Compact, inline language switcher. Three fixed codes, no dropdown, no modal.
 */
export function LanguageSwitcher({ variant = "bar" }: { variant?: "bar" | "stack" }) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      role="group"
      aria-label="Language"
      className={`flex items-stretch border border-[var(--line)] ${
        variant === "stack" ? "w-full" : ""
      }`}
    >
      {locales.map((code: Locale) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            aria-label={code}
            className={`label press flex-1 border-r border-[var(--line)] px-3 py-2.5 transition-colors last:border-r-0 sm:px-4 ${
              active ? "bg-forest text-white" : "text-ink/50 hover:bg-sage/40 hover:text-ink"
            } ${variant === "stack" ? "py-4" : ""}`}
          >
            {localeShort[code]}
          </button>
        );
      })}
    </div>
  );
}
