/**
 * Resolves the canonical site URL safely.
 *
 * An empty `SITE_URL` (for example an unset-in-place variable in a hosting
 * dashboard) must never reach `new URL("")`, which throws and breaks the
 * production build. Vercel's own domain variables are used when available.
 */
const FALLBACK = "https://elvet.uz";

function normalise(value: string | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function siteUrl(): string {
  const candidates = [
    normalise(process.env.SITE_URL),
    normalise(process.env.VERCEL_PROJECT_PRODUCTION_DOMAIN),
    normalise(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    normalise(process.env.VERCEL_URL),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
    try {
      return new URL(withProtocol).toString().replace(/\/$/, "");
    } catch {
      continue;
    }
  }

  return FALLBACK;
}

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
