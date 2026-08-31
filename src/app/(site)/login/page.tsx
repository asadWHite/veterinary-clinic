import { getI18n } from "@/i18n/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/forms";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your companions and appointments.",
};

export default async function LoginPage() {
  const { t } = await getI18n();
  const user = await getSessionUser();
  if (user) redirect("/account");

  return (
    <AuthShell
      eyebrow={t("auth.eyebrow")}
      title={t("auth.loginTitle")}
      footer={
        <p className="label leading-[1.9] text-ink/35">
          Accounts are optional — you can always book as a guest.
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
