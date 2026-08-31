import { getI18n } from "@/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/forms";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { t } = await getI18n();
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell eyebrow="Account" title={t("auth.resetTitle")}>
        <p className="body-lg">
          This page needs a reset link. Request a new one and use it within an hour.
        </p>
        <Link href="/forgot-password" className="label arrow-forward mt-8 inline-flex items-center gap-3 text-forest">
          Request a new link
          <span className="arrow">→</span>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Account" title={t("auth.resetTitle")}>
      <ResetForm token={token} />
    </AuthShell>
  );
}
