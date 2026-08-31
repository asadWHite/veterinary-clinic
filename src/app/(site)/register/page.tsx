import { getI18n } from "@/i18n/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/forms";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Save your companions, appointments and reminders in one place.",
};

export default async function RegisterPage() {
  const { t } = await getI18n();
  const user = await getSessionUser();
  if (user) redirect("/account");

  return (
    <AuthShell eyebrow="Account" title={t("auth.registerTitle")} assetId="puppy">
      <RegisterForm />
    </AuthShell>
  );
}
