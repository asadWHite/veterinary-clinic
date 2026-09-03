"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  updateProfileAction,
  type AuthState,
} from "@/features/auth/actions";
import { FormNote, Spinner } from "@/components/ui/Bits";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import { LOCALE_LANGUAGE_NAMES, LOCALES, type Locale } from "@/lib/i18n/config";

export function ProfileForm({
  fullName,
  phone,
  email,
  locale,
}: {
  fullName: string;
  phone: string;
  email: string;
  locale: Locale;
}) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthState, FormData>(updateProfileAction, {});
  const [selectedLocale, setSelectedLocale] = useLocaleState(locale);

  return (
    <form action={action} className="flex flex-col gap-6 border border-line bg-canvas-2/40 p-6 sm:p-8">
      <input type="hidden" name="locale" value={selectedLocale} />
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("account.settings.fullName")}</span>
        <input
          name="fullName"
          defaultValue={fullName}
          required
          className="field-input"
          key={`name-${fullName}`}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("account.settings.phone")}</span>
        <input name="phone" defaultValue={phone} className="field-input" key={`phone-${phone}`} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("account.settings.email")}</span>
        <input value={email} readOnly disabled className="field-input opacity-60" />
      </label>
      <div className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("account.settings.language")}</span>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedLocale(code)}
              aria-pressed={selectedLocale === code}
              className={cn(
                "border px-4 py-2.5 text-sm transition-colors",
                selectedLocale === code
                  ? "border-forest text-forest"
                  : "border-line text-ink-2 hover:border-ink/40",
              )}
            >
              {LOCALE_LANGUAGE_NAMES[code]}
            </button>
          ))}
        </div>
      </div>

      {state.ok && <p className="text-sm text-forest">{t("account.settings.updated")}</p>}
      {state.error && <FormNote>{t(state.error)}</FormNote>}

      <button type="submit" disabled={pending} className="btn btn-primary self-start">
        {pending ? (
          <>
            <Spinner /> {t("common.saving")}
          </>
        ) : (
          t("common.save")
        )}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className="flex flex-col gap-6 border border-line bg-canvas-2/40 p-6 sm:p-8">
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("account.settings.current")}</span>
        <input name="current" type="password" required className="field-input" autoComplete="current-password" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("account.settings.new")}</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="field-input"
          autoComplete="new-password"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("account.settings.confirm")}</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          className="field-input"
          autoComplete="new-password"
        />
      </label>
      {state.ok && <p className="text-sm text-forest">{t("account.settings.passwordUpdated")}</p>}
      {state.error && <FormNote>{t(state.error)}</FormNote>}
      <button type="submit" disabled={pending} className="btn btn-ghost self-start">
        {pending ? (
          <>
            <Spinner /> {t("common.saving")}
          </>
        ) : (
          t("account.settings.password")
        )}
      </button>
    </form>
  );
}

import { useState } from "react";

function useLocaleState(initial: Locale): [Locale, (value: Locale) => void] {
  return useState<Locale>(initial);
}
