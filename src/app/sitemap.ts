import type { MetadataRoute } from "next";
import { apiPublicSafe } from "@/lib/apiServer";
import type { ApiCategory, ApiPost } from "@/lib/models";
import { absoluteUrl } from "@/lib/site";

// Re-generate the sitemap on a schedule so newly-published posts appear.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([
    apiPublicSafe<ApiPost[]>("/posts?limit=1000&status=published", []),
    apiPublicSafe<ApiCategory[]>("/categories", []),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/resources/ai-tools-starter-kit"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/cookies"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/disclosure"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: new Date(p.publishedAt ?? p.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`/category/${c.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
}
