// "Nexversal Opportunity Score" — an INTERNAL, clearly-labelled heuristic.
//
// This is NOT a Google/Ahrefs metric and must never be presented as one. It
// combines the signals we actually have. When a real signal is missing (e.g.
// no keyword provider → no search volume/difficulty), that factor is dropped
// and the score is computed from the remaining REAL inputs, with `basis`
// listing exactly what went in. We never invent a number to fill a gap.
//
// Domain-age aware: for a young domain (Nexversal), lower competition and
// long-tail specificity are weighted UP, because those are the realistically
// winnable queries.

export type DomainStage = "new" | "growing" | "established";

export type OpportunityInputs = {
  /** From a keyword provider, if connected. */
  searchVolume?: number | null;
  difficulty?: number | null; // 0..100
  /** From a trends provider, if connected. -100..+∞ momentum %. */
  trendMomentumPct?: number | null;
  /** From our own DB / engine. */
  topicalRelevance?: number | null; // 0..1 — fit to Nexversal's niche
  /** GSC: are we already ranking (avg position)? Lower = better. */
  currentPosition?: number | null;
  /** Length of the target phrase in words — long-tail proxy. */
  keywordWordCount?: number | null;
};

export type OpportunityScore = {
  score: number; // 0..100
  label: "AI recommendation"; // provenance — never "measured"
  basis: string[]; // which real signals contributed
  missing: string[]; // signals we did NOT have (shown as "Data unavailable")
  domainStage: DomainStage;
};

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

export function computeOpportunityScore(
  inputs: OpportunityInputs,
  domainStage: DomainStage = "new",
): OpportunityScore {
  const basis: string[] = [];
  const missing: string[] = [];
  const parts: { weight: number; value: number }[] = [];

  // Domain-stage weighting: a young domain wins on low competition + long-tail.
  const competitionWeight = domainStage === "new" ? 0.4 : domainStage === "growing" ? 0.3 : 0.2;
  const demandWeight = domainStage === "new" ? 0.15 : 0.25;

  if (typeof inputs.difficulty === "number") {
    parts.push({ weight: competitionWeight, value: 100 - clamp(inputs.difficulty) });
    basis.push(`keyword difficulty ${inputs.difficulty} (real)`);
  } else {
    missing.push("keyword difficulty");
  }

  if (typeof inputs.searchVolume === "number") {
    // Log-scaled: volume matters but a young domain shouldn't chase huge terms.
    const v = clamp(Math.log10(Math.max(1, inputs.searchVolume)) * 25);
    parts.push({ weight: demandWeight, value: v });
    basis.push(`search volume ${inputs.searchVolume} (real)`);
  } else {
    missing.push("search volume");
  }

  if (typeof inputs.trendMomentumPct === "number") {
    parts.push({ weight: 0.15, value: clamp(50 + inputs.trendMomentumPct) });
    basis.push(`trend momentum ${inputs.trendMomentumPct}% (real)`);
  } else {
    missing.push("trend momentum");
  }

  if (typeof inputs.topicalRelevance === "number") {
    parts.push({ weight: 0.2, value: clamp(inputs.topicalRelevance * 100) });
    basis.push(`topical relevance ${(inputs.topicalRelevance * 100).toFixed(0)}% (internal)`);
  } else {
    missing.push("topical relevance");
  }

  if (typeof inputs.currentPosition === "number") {
    // Positions 8–20 are the classic "quick win" band — weight them up.
    const p = inputs.currentPosition;
    const v = p >= 8 && p <= 20 ? 90 : p < 8 ? 60 : clamp(100 - p * 2);
    parts.push({ weight: 0.15, value: v });
    basis.push(`current position ${p} (Search Console)`);
  } else {
    missing.push("current ranking position");
  }

  if (typeof inputs.keywordWordCount === "number") {
    // Long-tail bonus for a young domain.
    const longTail = clamp(inputs.keywordWordCount >= 4 ? 90 : inputs.keywordWordCount * 22);
    parts.push({ weight: domainStage === "new" ? 0.15 : 0.05, value: longTail });
    basis.push(`long-tail specificity (${inputs.keywordWordCount} words)`);
  }

  if (parts.length === 0) {
    return { score: 0, label: "AI recommendation", basis: [], missing, domainStage };
  }

  const totalWeight = parts.reduce((s, p) => s + p.weight, 0);
  const score = Math.round(parts.reduce((s, p) => s + p.weight * p.value, 0) / totalWeight);

  return { score: clamp(score), label: "AI recommendation", basis, missing, domainStage };
}
