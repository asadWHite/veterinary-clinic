import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n/I18nProvider";

export function AuthShell({
  eyebrow,
  title,
  children,
  footer,
  assetId = "kitten",
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  assetId?: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12">
      <div className="flex items-end justify-center border-b border-[var(--line)] bg-canvas py-10 lg:col-span-5 lg:border-b-0 lg:border-r lg:py-0">
        <Image
          src={`/images/animals/${assetId === "kitten" ? "kitten-white-background" : "puppy-white-background"}.jpg`}
          alt=""
          width={1024}
          height={1024}
          sizes="(max-width: 1024px) 70vw, 40vw"
          className="h-auto w-full max-w-[380px] select-none"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>
      <div className="lg:col-span-7">
        <div className="mx-auto max-w-xl px-[var(--gutter)] py-12 lg:py-20">
          <Link href="/" className="label link-underline text-ink/45 hover:text-ink">
            ← Back
          </Link>
          <p className="label mt-10 text-ink/40">{eyebrow}</p>
          <h1 className="display d3 mt-4 uppercase">{title}</h1>
          <div className="mt-10">{children}</div>
          {footer ? <div className="mt-10 border-t border-[var(--line)] pt-6">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
