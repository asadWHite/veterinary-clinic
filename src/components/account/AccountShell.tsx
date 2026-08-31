import type { ReactNode } from "react";
import { getI18n } from "@/i18n/server";
import Link from "next/link";
import { AccountNav } from "@/components/account/AccountNav";

export async function AccountShell({ children }: { children: ReactNode }) {
  const { t } = await getI18n();
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-canvas/95 backdrop-blur-[6px]">
        <div className="shell flex h-16 items-center justify-between gap-6">
          <Link href="/" className="label link-underline text-ink/55 hover:text-ink">
            ← Back to site
          </Link>
          <p className="display d5 uppercase">{t("account.title")}</p>
          <span className="label hidden text-ink/35 sm:block">[CLINIC NAME]</span>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <AccountNav />
        </div>
        <main className="lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}
