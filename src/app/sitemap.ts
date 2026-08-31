import type { MetadataRoute } from "next";
import { journalArticles } from "@/data/journal";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/care",
    "/doctors",
    "/journal",
    "/gallery",
    "/contact",
    "/booking",
    "/login",
    "/register",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const articles = journalArticles.map((article) => ({
    url: `${site.url}/journal/${article.slug}`,
    lastModified: new Date(article.published),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...articles];
}
