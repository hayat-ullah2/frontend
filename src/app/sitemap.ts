import type { MetadataRoute } from "next";
import { apiPublicSafe } from "@/lib/apiServer";
import type { ApiCategory, ApiPost } from "@/lib/models";
import { absoluteUrl } from "@/lib/site";

// Always render the sitemap fresh from the backend. Previously this route was
// statically cached (revalidate=300 + a cached fetch), which froze the sitemap
// at build time — newly-published posts never appeared and on-demand
// revalidation of this metadata route proved unreliable. The sitemap is
// low-traffic (crawlers only), so rendering it dynamically with an uncached
// fetch is cheap and guarantees every published post is always listed.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([
    // revalidate=0 → fetched with cache: "no-store" so we always see current posts.
    apiPublicSafe<ApiPost[]>("/posts?limit=1000&status=published", [], undefined, 0),
    apiPublicSafe<ApiCategory[]>("/categories", [], undefined, 0),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/resources/ai-tools-starter-kit"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/how-we-test"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/editorial-policy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
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

  const categoryRoutes: MetadataRoute.Sitemap = categories
    // Don't advertise empty category pages — they're noindex'd anyway (#4).
    .filter((c) => (c.postCount ?? 0) > 0)
    .map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
}
