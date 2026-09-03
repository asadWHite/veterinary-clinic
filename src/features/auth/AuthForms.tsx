"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  loginAction,
  registerAction,
  requestPasswordResetAction,
  resetPasswordAction,
  type AuthState,
} from "@/features/auth/actions";
import { FormNote, Spinner } from "@/components/ui/Bits";
import { useI18n } from "@/lib/i18n/client";

function Submit({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full">
      {pending ? (
        <>
          <Spinner /> …
        </>
      ) : (
        label
      )}
    </button>
  );
}

export function LoginForm({ locale }: { locale: "uz" | "ru" | "en" }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, {});
  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("auth.email")}</span>
        <input name="email" type="email" required autoComplete="email" className="field-input" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("auth.password")}</span>
        <input name="password" type="password" required autoComplete="current-password" className="field-input" />
      </label>
      {state.error && <FormNote>{t(state.error)}</FormNote>}
      <Submit label={t("auth.signIn")} pending={pending} />
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-2">
        <Link href={`/${locale}/forgot-password`} className="link-underline">
          {t("auth.forgot")}
        </Link>
        <span>
          {t("auth.noAccount")}{" "}
          <Link href={`/${locale}/register`} className="link-underline text-forest">
            {t("auth.register")}
          </Link>
        </span>
      </div>
    </form>
  );
}

export function RegisterForm({ locale }: { locale: "uz" | "ru" | "en" }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, {});
  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("auth.fullName")}</span>
        <input name="fullName" required autoComplete="name" className="field-input" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("auth.phone")}</span>
        <input name="phone" inputMode="tel" autoComplete="tel" className="field-input" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("auth.email")}</span>
        <input name="email" type="email" required autoComplete="email" className="field-input" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("auth.password")}</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field-input"
        />
        <span className="text-xs text-ink-2">{t("auth.passwordHint")}</span>
      </label>
      {state.error && <FormNote>{t(state.error)}</FormNote>}
      <Submit label={t("auth.signUp")} pending={pending} />
      <p className="text-xs leading-relaxed text-ink-2">{t("auth.privacyNote")}</p>
      <span className="text-xs text-ink-2">
        {t("auth.haveAccount")}{" "}
        <Link href={`/${locale}/login`} className="link-underline text-forest">
          {t("auth.login")}
        </Link>
      </span>
    </form>
  );
}

export function ForgotForm({ locale }: { locale: "uz" | "ru" | "en" }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthState, FormData>(
    requestPasswordResetAction,
    {},
  );
  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("auth.email")}</span>
        <input name="email" type="email" required autoComplete="email" className="field-input" />
      </label>
      {state.error && <FormNote>{t(state.error)}</FormNote>}
      <Submit label={t("auth.signIn")} pending={pending} />
      {state.ok && (
        <div className="flex flex-col gap-3 border border-forest/30 bg-canvas-2/60 p-5">
          <p className="text-sm leading-relaxed text-ink-2">{t("auth.forgotSent")}</p>
          {state.resetToken && (
            <>
              <p className="text-xs text-ink-2">{t("auth.forgotDevToken")}</p>
              <Link
                href={`/${locale}/reset-password?token=${state.resetToken}`}
                className="link-underline text-sm text-forest"
              >
                {t("auth.reset")}
              </Link>
            </>
          )}
        </div>
      )}
      <Link href={`/${locale}/login`} className="link-underline text-xs text-ink-2">
        {t("auth.backToLogin")}
      </Link>
    </form>
  );
}

export function ResetForm({ locale, token }: { locale: "uz" | "ru" | "en"; token: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthState, FormData>(resetPasswordAction, {});
  if (state.ok) {
    return (
      <div className="flex flex-col gap-5 border border-forest/30 bg-canvas-2/60 p-6">
        <p className="text-sm leading-relaxed text-ink-2">{t("auth.resetDone")}</p>
        <Link href={`/${locale}/login`} className="btn btn-primary">
          {t("auth.signIn")}
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("auth.new")}</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field-input"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("auth.confirm")}</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field-input"
        />
      </label>
      {state.error && <FormNote>{t(state.error)}</FormNote>}
      <Submit label={t("auth.reset")} pending={pending} />
    </form>
  );
}
