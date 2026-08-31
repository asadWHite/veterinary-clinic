import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE } from "@/i18n/config";

/**
 * Supports localized entry URLs (?lang=uz|ru|en) by persisting the locale
 * cookie and redirecting to the clean path. This keeps hreflang links honest
 * without restructuring the routing.
 */
export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang");

  if (!lang || !isLocale(lang)) return NextResponse.next();

  url.searchParams.delete("lang");
  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images|api|favicon.ico|robots.txt|sitemap.xml).*)"],
};
