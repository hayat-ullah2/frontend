// Topic-cluster mapping — real internal data.
//
// Groups the library into pillar/supporting clusters. A cluster is keyed by an
// explicit `contentCluster.name` when set, otherwise by category. We surface:
//   - the pillar article (contentCluster.pillar === true, or the highest-scoring
//     broad article in the group)
//   - supporting articles
//   - internal-link gaps (supporting articles not yet linked from the pillar)

import { type SeoPostLike } from "./shared.js";

export type ClusterView = {
  key: string;
  name: string;
  pillar: { id: string; title: string; slug: string } | null;
  supporting: { id: string; title: string; slug: string; seoScore: number | null }[];
  size: number;
  avgScore: number | null;
  hasPillar: boolean;
};

function clusterKey(p: SeoPostLike): { key: string; name: string } {
  const c = p.contentCluster?.name?.trim();
  if (c) return { key: `cluster:${c.toLowerCase()}`, name: c };
  const cat = p.categoryName?.trim();
  if (cat) return { key: `cat:${p.categorySlug}`, name: cat };
  return { key: "uncategorized", name: "Uncategorized" };
}

export function buildClusters(posts: SeoPostLike[]): ClusterView[] {
  const groups = new Map<string, { name: string; posts: SeoPostLike[] }>();
  for (const p of posts) {
    const { key, name } = clusterKey(p);
    if (!groups.has(key)) groups.set(key, { name, posts: [] });
    groups.get(key)!.posts.push(p);
  }

  const views: ClusterView[] = [];
  for (const [key, { name, posts: group }] of groups) {
    const explicitPillar = group.find((p) => p.contentCluster?.pillar);
    const pillar =
      explicitPillar ??
      [...group].sort((a, b) => (b.seoScore ?? 0) - (a.seoScore ?? 0))[0] ??
      null;
    const supporting = group
      .filter((p) => String(p._id) !== String(pillar?._id))
      .sort((a, b) => (b.seoScore ?? 0) - (a.seoScore ?? 0))
      .map((p) => ({ id: String(p._id), title: p.title, slug: p.slug, seoScore: p.seoScore ?? null }));
    const scores = group.map((p) => p.seoScore ?? 0).filter((s) => s > 0);
    views.push({
      key,
      name,
      pillar: pillar ? { id: String(pillar._id), title: pillar.title, slug: pillar.slug } : null,
      supporting,
      size: group.length,
      avgScore: scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : null,
      hasPillar: Boolean(explicitPillar),
    });
  }

  return views.sort((a, b) => b.size - a.size);
}
