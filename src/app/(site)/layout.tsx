import type { ReactNode } from "react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { DbNotice } from "@/components/ui/DbNotice";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <DbNotice />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
