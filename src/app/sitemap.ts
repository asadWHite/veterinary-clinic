import type { MetadataRoute } from "next";
import { getDoctors, getJournalPosts, getServices } from "@/lib/queries";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const locales = ["uz", "ru", "en"] as const;
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const [services, doctors, posts] = await Promise.all([
      getServices(locale),
      getDoctors(locale),
      getJournalPosts(locale),
    ]);
    const staticPaths = ["", "/services", "/doctors", "/about", "/journal", "/reviews", "/book"];
    for (const path of staticPaths) {
      entries.push({
        url: `${base}/${locale}${path}`,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
    for (const service of services) {
      entries.push({ url: `${base}/${locale}/services/${service.slug}`, priority: 0.6 });
    }
    for (const doctor of doctors) {
      entries.push({ url: `${base}/${locale}/doctors/${doctor.slug}`, priority: 0.6 });
    }
    for (const post of posts) {
      entries.push({ url: `${base}/${locale}/journal/${post.slug}`, priority: 0.5 });
    }
  }

  return entries;
}
