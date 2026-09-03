import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

export default function NotFound() {
  const dictionary = getDictionary("uz");
  const locale: Locale = "uz";
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-8 px-5 py-28 sm:px-8">
      <span className="section-index">404</span>
      <h1 className="text-h1 font-normal tracking-tight text-ink">{dictionary.errors.notFoundTitle}</h1>
      <p className="max-w-lg text-[0.98rem] leading-relaxed text-ink-2">{dictionary.errors.notFoundBody}</p>
      <Link href={`/${locale}`} className="btn btn-primary">
        {dictionary.errors.goHome}
      </Link>
    </div>
  );
}
