// Keyword cannibalization detector — pure, real internal data.
//
// Two Nexversal articles "cannibalize" when they compete for the same query,
// splitting ranking signals. We detect it three ways, strongest first:
//   1. Identical primary keyword (after normalisation)  → high risk
//   2. Same search intent + very similar topic tokens   → medium/high
//   3. High title/topic overlap alone                   → medium
//
// We never auto-merge. We surface the pair, the evidence, and options.

import {
  jaccard,
  normKeyword,
  topicTokens,
  type SeoPostLike,
} from "./shared.js";

export type CannibalizationRisk = "high" | "medium" | "low";

export type CannibalizationPair = {
  a: { id: string; title: string; slug: string; primaryKeyword: string | null; seoScore: number | null };
  b: { id: string; title: string; slug: string; primaryKeyword: string | null; seoScore: number | null };
  risk: CannibalizationRisk;
  similarity: number; // 0..1 topic overlap
  reasons: string[];
  recommendations: string[];
};

function ref(p: SeoPostLike) {
  return {
    id: String(p._id),
    title: p.title,
    slug: p.slug,
    primaryKeyword: p.primaryKeyword ?? null,
    seoScore: p.seoScore ?? null,
  };
}

function recommendationsFor(risk: CannibalizationRisk, samePk: boolean): string[] {
  const recs: string[] = [];
  if (risk === "high") {
    recs.push(
      "Consolidate: keep the stronger article and 301-redirect the weaker one into it.",
      "Or clearly differentiate the target query of each (e.g. 'for beginners' vs 'for teams').",
    );
  } else {
    recs.push(
      "Differentiate the primary keyword and search intent of each article.",
      "Interlink them so the stronger page is the canonical answer for the shared query.",
    );
  }
  if (samePk) recs.push("They target the identical primary keyword — change one.");
  return recs;
}

/**
 * Find cannibalization pairs across a set of posts. If `target` is supplied,
 * only pairs involving that post are returned (used in the editor). Otherwise
 * every pair in the library is checked (used in the dashboard).
 */
export function detectCannibalization(
  posts: SeoPostLike[],
  opts: { target?: SeoPostLike; minSimilarity?: number } = {},
): CannibalizationPair[] {
  const minSim = opts.minSimilarity ?? 0.5;
  const fingerprints = new Map<string, Set<string>>();
  for (const p of posts) fingerprints.set(String(p._id), topicTokens(p));

  const out: CannibalizationPair[] = [];
  const seen = new Set<string>();

  const consider = (a: SeoPostLike, b: SeoPostLike) => {
    if (String(a._id) === String(b._id)) return;
    const key = [String(a._id), String(b._id)].sort().join(":");
    if (seen.has(key)) return;
    seen.add(key);

    const pkA = normKeyword(a.primaryKeyword);
    const pkB = normKeyword(b.primaryKeyword);
    const samePk = Boolean(pkA && pkA === pkB);
    const sim = jaccard(fingerprints.get(String(a._id))!, fingerprints.get(String(b._id))!);
    const sameIntent = Boolean(a.searchIntent && a.searchIntent === b.searchIntent);

    const reasons: string[] = [];
    let risk: CannibalizationRisk | null = null;

    if (samePk) {
      risk = sim >= 0.4 ? "high" : "medium";
      reasons.push(`Both target the primary keyword “${a.primaryKeyword}”.`);
    }
    if (sim >= minSim) {
      reasons.push(`Topic overlap is ${(sim * 100).toFixed(0)}% (titles/keywords/headings).`);
      if (sameIntent) reasons.push(`Both have ${a.searchIntent} search intent.`);
      const bumped = sim >= 0.7 && sameIntent ? "high" : "medium";
      risk = risk === "high" ? "high" : bumped;
    }

    if (!risk) return;
    out.push({
      a: ref(a),
      b: ref(b),
      risk,
      similarity: Number(sim.toFixed(3)),
      reasons,
      recommendations: recommendationsFor(risk, samePk),
    });
  };

  if (opts.target) {
    for (const p of posts) consider(opts.target, p);
  } else {
    for (let i = 0; i < posts.length; i++) {
      for (let j = i + 1; j < posts.length; j++) consider(posts[i], posts[j]);
    }
  }

  const order: Record<CannibalizationRisk, number> = { high: 0, medium: 1, low: 2 };
  return out.sort((x, y) => order[x.risk] - order[y.risk] || y.similarity - x.similarity);
}
