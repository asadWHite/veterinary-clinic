import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account/ProfileForm";
import { LogoutButton } from "@/components/account/LogoutButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function AccountSettingsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <div className="px-[var(--gutter)] py-10 lg:py-14">
      <p className="label text-ink/40">Settings</p>
      <h1 className="display d2 mt-5 uppercase">Your details.</h1>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ProfileForm name={user.name} phone={user.phone ?? ""} email={user.email} />
        </div>
        <div className="lg:col-span-5">
          <div className="border-t border-[var(--line)] pt-6 lg:border-t-0">
            <p className="label text-ink/40">Security</p>
            <p className="mt-4 text-sm leading-relaxed text-ink/60">
              Signing out ends this session on this device. Passwords are changed with a reset link.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/forgot-password"
                className="label border border-[var(--line)] px-5 py-4 text-ink/60 transition-colors hover:border-ink hover:text-ink"
              >
                Change password
              </Link>
              <LogoutButton />
            </div>

            <p className="label mt-10 text-ink/40">Data</p>
            <p className="mt-4 text-sm leading-relaxed text-ink/60">
              Your companions, appointments and notes are visible only to you and the clinic. Ask us
              any time for a copy or a deletion.
            </p>
            <Link href="/privacy" className="label link-underline mt-4 inline-block text-forest">
              Privacy notice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
