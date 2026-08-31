import { getI18n } from "@/i18n/server";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/forms";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a password reset link.",
};

export default async function ForgotPasswordPage() {
  const { t } = await getI18n();
  return (
    <AuthShell
      eyebrow={t("auth.eyebrow")}
      title={t("auth.forgotTitle")}
      footer={
        <p className="label leading-[1.9] text-ink/35">
          {t("auth.deliveryNote")}
        </p>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
