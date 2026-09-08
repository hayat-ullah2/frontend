// Internal-link suggestion agent — real internal data.
//
// Given a source article, rank OTHER published Nexversal articles by topical
// relevance and propose a natural anchor + a reason. We deliberately DO NOT
// suggest links that already exist in the body, and we bias toward same-cluster
// / same-category articles so links reinforce topical authority rather than
// padding a link count.

import {
  jaccard,
  topicTokens,
  type SeoPostLike,
} from "./shared.js";

export type InternalLinkSuggestion = {
  targetId: string;
  targetTitle: string;
  targetSlug: string;
  anchor: string;
  reason: string;
  relevance: number; // 0..100
  sameCluster: boolean;
  sameCategory: boolean;
};

/** Slugs already linked from the source content (so we never re-suggest them). */
function existingLinkedSlugs(html: string): Set<string> {
  const out = new Set<string>();
  const re = /href\s*=\s*["']([^"']*\/blog\/([a-z0-9-]+))["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html || ""))) out.add(m[2]);
  return out;
}

function pickAnchor(target: SeoPostLike): string {
  // Prefer the target's primary keyword as anchor when it's a clean phrase;
  // otherwise fall back to a trimmed title. Never keyword-stuff the anchor.
  const pk = (target.primaryKeyword ?? "").trim();
  if (pk && pk.split(/\s+/).length <= 6) return pk;
  return target.title.replace(/\s*[:\-–|].*$/, "").trim() || target.title;
}

export function suggestInternalLinks(
  source: SeoPostLike,
  library: SeoPostLike[],
  opts: { limit?: number; minRelevance?: number } = {},
): InternalLinkSuggestion[] {
  const limit = opts.limit ?? 6;
  const minRel = opts.minRelevance ?? 12;
  const srcTokens = topicTokens(source);
  const alreadyLinked = existingLinkedSlugs(source.content ?? "");
  const srcCluster = source.contentCluster?.name?.trim().toLowerCase() || null;

  const scored = library
    .filter((p) => String(p._id) !== String(source._id))
    .filter((p) => (p.status ? p.status === "published" : true))
    .filter((p) => !alreadyLinked.has(p.slug))
    .map((p) => {
      const sim = jaccard(srcTokens, topicTokens(p));
      const sameCluster = Boolean(
        srcCluster && p.contentCluster?.name?.trim().toLowerCase() === srcCluster,
      );
      const sameCategory = Boolean(
        source.categorySlug && p.categorySlug && source.categorySlug === p.categorySlug,
      );
      // Relevance: topic similarity, boosted for shared cluster/category.
      let relevance = sim * 100;
      if (sameCluster) relevance += 18;
      if (sameCategory) relevance += 8;
      relevance = Math.min(100, Math.round(relevance));

      const reasonParts: string[] = [];
      if (sameCluster) reasonParts.push(`same “${source.contentCluster?.name}” cluster`);
      else if (sameCategory) reasonParts.push(`same ${source.categoryName ?? "category"}`);
      if (sim > 0) reasonParts.push(`${(sim * 100).toFixed(0)}% topic overlap`);

      return {
        targetId: String(p._id),
        targetTitle: p.title,
        targetSlug: p.slug,
        anchor: pickAnchor(p),
        reason: reasonParts.length
          ? `Relevant: ${reasonParts.join(", ")}.`
          : "Topically related article.",
        relevance,
        sameCluster,
        sameCategory,
      } satisfies InternalLinkSuggestion;
    })
    .filter((s) => s.relevance >= minRel)
    .sort((a, b) => b.relevance - a.relevance);

  return scored.slice(0, limit);
}
