"use server";

import { and, eq, gt, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/db";
import { passwordResets, profiles, sessions } from "@/db/schema";
import {
  createSession,
  destroySession,
  generateToken,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { LOCALE_COOKIE, normalizeLocale, type Locale } from "@/lib/i18n/config";

export type AuthState = {
  error?: string;
  ok?: boolean;
  resetToken?: string;
};

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function setLocaleCookie(locale: Locale) {
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}

export async function registerAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = normalizeLocale(String(formData.get("locale") ?? "uz"));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName || fullName.length < 2) return { error: "auth.errors.required" };
  if (!EMAIL_PATTERN.test(email)) return { error: "auth.errors.invalidEmail" };
  if (password.length < 8) return { error: "auth.errors.short" };

  try {
    const existing = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1);
    if (existing.length > 0) return { error: "auth.errors.taken" };

    const passwordHash = await hashPassword(password);
    const inserted = await db
      .insert(profiles)
      .values({
        email,
        passwordHash,
        fullName,
        phone: phone || null,
        locale,
        role: "user",
      })
      .returning({ id: profiles.id });

    const userId = inserted[0]?.id;
    if (!userId) return { error: "auth.errors.generic" };
    await createSession(userId);
    await setLocaleCookie(locale);
  } catch {
    return { error: "auth.errors.generic" };
  }
  redirect(`/${locale}/account`);
}

export async function loginAction(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const locale = normalizeLocale(String(formData.get("locale") ?? "uz"));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!EMAIL_PATTERN.test(email) || password.length === 0) return { error: "auth.errors.invalid" };

  try {
    const rows = await db
      .select({ id: profiles.id, passwordHash: profiles.passwordHash })
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);
    const row = rows[0];
    if (!row || !(await verifyPassword(password, row.passwordHash))) {
      return { error: "auth.errors.invalid" };
    }
    await createSession(row.id);
    await setLocaleCookie(locale);
  } catch {
    return { error: "auth.errors.generic" };
  }
  redirect(`/${locale}/account`);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  const locale = normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  redirect(`/${locale}`);
}

export async function requestPasswordResetAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = normalizeLocale(String(formData.get("locale") ?? "uz"));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return { error: "auth.errors.invalidEmail" };

  try {
    const rows = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1);
    const user = rows[0];
    // Always answer the same way so the endpoint cannot be used to enumerate accounts.
    if (!user) return { ok: true };
    const token = generateToken();
    const tokenHash = await hashPassword(token);
    await db.insert(passwordResets).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    return { ok: true, resetToken: token };
  } catch {
    return { error: "auth.errors.generic" };
  } finally {
    void locale;
  }
}

export async function resetPasswordAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = normalizeLocale(String(formData.get("locale") ?? "uz"));
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "auth.errors.short" };
  if (password !== confirm) return { error: "auth.errors.mismatch" };

  try {
    const rows = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          isNull(passwordResets.usedAt),
          gt(passwordResets.expiresAt, new Date()),
        ),
      )
      .orderBy(passwordResets.id);
    let match: { id: number; userId: number } | null = null;
    for (const row of rows) {
      if (await verifyPassword(token, row.tokenHash)) {
        match = { id: row.id, userId: row.userId };
        break;
      }
    }
    if (!match) return { error: "auth.errors.token" };

    const passwordHash = await hashPassword(password);
    await db.update(profiles).set({ passwordHash, updatedAt: new Date() }).where(eq(profiles.id, match.userId));
    await db
      .update(passwordResets)
      .set({ usedAt: new Date() })
      .where(eq(passwordResets.id, match.id));
    // Invalidate other sessions of that user.
    await db.delete(sessions).where(eq(sessions.userId, match.userId));
    return { ok: true };
  } catch {
    return { error: "auth.errors.generic" };
  } finally {
    void locale;
  }
}

export async function updateProfileAction(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) return { error: "auth.errors.generic" };
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const locale = normalizeLocale(String(formData.get("locale") ?? user.locale));
  if (fullName.length < 2) return { error: "auth.errors.required" };
  try {
    await db
      .update(profiles)
      .set({ fullName, phone: phone || null, locale, updatedAt: new Date() })
      .where(eq(profiles.id, user.id));
    await setLocaleCookie(locale);
    return { ok: true };
  } catch {
    return { error: "auth.errors.generic" };
  }
}

export async function changePasswordAction(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) return { error: "auth.errors.generic" };
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next.length < 8) return { error: "auth.errors.short" };
  if (next !== confirm) return { error: "auth.errors.mismatch" };
  try {
    const rows = await db
      .select({ passwordHash: profiles.passwordHash })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);
    const row = rows[0];
    if (!row || !(await verifyPassword(current, row.passwordHash))) {
      return { error: "auth.errors.invalid" };
    }
    const passwordHash = await hashPassword(next);
    await db.update(profiles).set({ passwordHash, updatedAt: new Date() }).where(eq(profiles.id, user.id));
    return { ok: true };
  } catch {
    return { error: "auth.errors.generic" };
  }
}
