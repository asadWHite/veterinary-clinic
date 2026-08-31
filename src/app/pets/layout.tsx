import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account/AccountShell";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PetsLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <AccountShell>{children}</AccountShell>;
}
