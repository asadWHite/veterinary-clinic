"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  required = true,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label text-ink/45">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full border-b border-ink/25 bg-transparent pb-3 text-lg font-semibold tracking-[-0.01em] outline-none transition-colors placeholder:text-ink/25 focus:border-ink"
      />
    </div>
  );
}

function Submit({ label, busy, busyLabel = "One moment…" }: { label: string; busy: boolean; busyLabel?: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="label arrow-forward mt-10 flex w-full items-center justify-between gap-4 bg-ink px-8 py-5 text-white transition-colors hover:bg-forest disabled:opacity-40"
    >
      {busy ? busyLabel : label}
      <span className="arrow">→</span>
    </button>
  );
}

function Notice({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="label mt-6 border-l-2 border-forest pl-4 text-forest">
      {message}
    </p>
  );
}

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(localizeAuthError(data.error, t));
          setBusy(false);
          return;
        }
        router.push("/account");
        router.refresh();
      }}
    >
      <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Field
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />
      <Notice message={error} />
      <Submit label={t("auth.signIn")} busy={busy} busyLabel={t("auth.signingIn")} />
      <div className="flex items-center justify-between gap-4">
        <Link href="/forgot-password" className="label link-underline text-ink/50 hover:text-ink">
          {t("auth.forgot")}
        </Link>
        <Link href="/register" className="label link-underline text-forest">
          {t("auth.noAccount")}
        </Link>
      </div>
    </form>
  );
}

export function RegisterForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  return (
    <form
      className="space-y-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(localizeAuthError(data.error, t));
          setBusy(false);
          return;
        }
        router.push("/account");
        router.refresh();
      }}
    >
      <Field id="name" label="Your name" value={form.name} onChange={set("name")} autoComplete="name" />
      <Field id="email" label="Email" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
      <Field
        id="phone"
        label="Phone"
        type="tel"
        value={form.phone}
        onChange={set("phone")}
        autoComplete="tel"
        required={false}
        placeholder="[PHONE]"
      />
      <Field
        id="password"
        label="Password"
        type="password"
        value={form.password}
        onChange={set("password")}
        autoComplete="new-password"
      />
      <p className="label text-ink/35">{t("auth.passwordHint")}</p>
      <Notice message={error} />
      <Submit label={t("auth.createAccount")} busy={busy} busyLabel={t("auth.signingIn")} />
      <Link href="/login" className="label link-underline text-ink/50 hover:text-ink">
        {t("auth.haveAccount")}
      </Link>
    </form>
  );
}

export function ForgotForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (sent) {
    return (
      <div>
        <p className="body-lg">{t("auth.resetSent", { email })}</p>
        {token ? (
          <div className="mt-8 border border-[var(--line)] p-5">
            <p className="label text-ink/40">{t("auth.resetLink")}</p>
            <Link href={`/reset-password?token=${token}`} className="mono-num mt-3 block break-all text-sm text-forest underline">
              /reset-password?token={token}
            </Link>
          </div>
        ) : null}
        <Link href="/login" className="label link-underline mt-8 inline-block text-ink/50 hover:text-ink">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const res = await fetch("/api/auth/forgot", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = (await res.json()) as { token?: string | null };
        setToken(data.token ?? null);
        setSent(true);
        setBusy(false);
      }}
    >
      <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Submit label={t("auth.sendReset")} busy={busy} busyLabel={t("auth.signingIn")} />
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch("/api/auth/reset", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(localizeAuthError(data.error, t));
          setBusy(false);
          return;
        }
        router.push("/login");
        router.refresh();
      }}
    >
      <Field
        id="password"
        label="New password"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      <Notice message={error} />
      <Submit label={t("auth.setNewPassword")} busy={busy} busyLabel={t("auth.signingIn")} />
    </form>
  );
}

function localizeAuthError(message: string | undefined, t: (k: string) => string): string {
  const value = message ?? "";
  if (/incorrect/i.test(value)) return t("auth.errors.invalidCredentials");
  if (/already exists/i.test(value)) return t("auth.errors.emailExists");
  if (/at least 8/i.test(value)) return t("auth.errors.weakPassword");
  if (/valid email/i.test(value)) return t("auth.errors.invalidEmail");
  if (/your name/i.test(value)) return t("auth.errors.nameRequired");
  if (/expired/i.test(value)) return t("auth.errors.expired");
  return t("auth.errors.generic");
}
