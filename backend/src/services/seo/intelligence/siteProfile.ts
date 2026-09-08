// Site SEO Profile — real internal data + optional real Search Console data.
//
// The internal half (content counts, topical coverage, avg score) is always
// real. The authority/traffic half is filled ONLY from Search Console when
// connected; otherwise those fields are explicitly null and the caller renders
// "Data unavailable" (see providerStatus + the /overview endpoint).

import { type SeoPostLike } from "./shared.js";

export type SiteProfile = {
  domain: string;
  domainStage: "new" | "growing" | "established";
  content: {
    totalPosts: number;
    published: number;
    drafts: number;
    categories: number;
    clusters: number;
    avgSeoScore: number;
    topicalCoverage: { name: string; count: number }[];
  };
  // Filled from Search Console when connected, else null → "Data unavailable".
  search: {
    connected: boolean;
    source: "google-search-console" | "unavailable";
    clicks: number | null;
    impressions: number | null;
    ctr: number | null;
    avgPosition: number | null;
    period?: { startDate: string; endDate: string };
  };
};

export type GscTotals = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  startDate: string;
  endDate: string;
};

export function buildSiteProfile(
  domain: string,
  posts: SeoPostLike[],
  categoryCount: number,
  gsc: GscTotals | null,
): SiteProfile {
  const published = posts.filter((p) => p.status === "published");
  const drafts = posts.filter((p) => p.status === "draft");
  const scores = posts.map((p) => p.seoScore ?? 0).filter((s) => s > 0);
  const avgScore = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : 0;

  const clusterNames = new Set<string>();
  const coverage = new Map<string, number>();
  for (const p of posts) {
    const cl = p.contentCluster?.name?.trim();
    if (cl) clusterNames.add(cl.toLowerCase());
    const cat = p.categoryName?.trim() || "Uncategorized";
    coverage.set(cat, (coverage.get(cat) ?? 0) + 1);
  }

  // Domain stage is derived from library size as a proxy until backlink/age data
  // is connected. Kept conservative — Nexversal is young.
  const stage: SiteProfile["domainStage"] =
    published.length >= 150 ? "established" : published.length >= 50 ? "growing" : "new";

  return {
    domain,
    domainStage: stage,
    content: {
      totalPosts: posts.length,
      published: published.length,
      drafts: drafts.length,
      categories: categoryCount,
      clusters: clusterNames.size,
      avgSeoScore: avgScore,
      topicalCoverage: [...coverage.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    },
    search: gsc
      ? {
          connected: true,
          source: "google-search-console",
          clicks: gsc.clicks,
          impressions: gsc.impressions,
          ctr: gsc.ctr,
          avgPosition: gsc.position,
          period: { startDate: gsc.startDate, endDate: gsc.endDate },
        }
      : {
          connected: false,
          source: "unavailable",
          clicks: null,
          impressions: null,
          ctr: null,
          avgPosition: null,
        },
  };
}
