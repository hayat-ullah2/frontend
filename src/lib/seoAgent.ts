import { api } from "./api";
import type { SeoAnalysis } from "./seo/engine";

// Client for the /api/seo (SEO Agent) endpoints. All values here originate from
// the server, which never fabricates external data — fields sourced from an
// unconnected provider come back flagged unavailable.

export type Confidence = "high" | "medium" | "low";
export type Impact = "high" | "medium" | "low";

export type ChangeProposal = {
  field: string;
  changeType: "title" | "meta-description" | "slug" | "alt-text" | "faq" | "other";
  before: string;
  after: string;
  reason: string;
  confidence: Confidence;
  impact: Impact;
  autoSafe: boolean;
  dataSources: string[];
};

export type CannibalizationPair = {
  a: { id: string; title: string; slug: string; primaryKeyword: string | null; seoScore: number | null };
  b: { id: string; title: string; slug: string; primaryKeyword: string | null; seoScore: number | null };
  risk: "high" | "medium" | "low";
  similarity: number;
  reasons: string[];
  recommendations: string[];
};

export type InternalLinkSuggestion = {
  targetId: string;
  targetTitle: string;
  targetSlug: string;
  anchor: string;
  reason: string;
  relevance: number;
  sameCluster: boolean;
  sameCategory: boolean;
};

export type OpportunityScore = {
  score: number;
  label: "AI recommendation";
  basis: string[];
  missing: string[];
  domainStage: "new" | "growing" | "established";
};

export type ArticleAnalysis = {
  analysis: SeoAnalysis;
  proposals: ChangeProposal[];
  cannibalization: CannibalizationPair[];
  internalLinks: InternalLinkSuggestion[];
  opportunity: OpportunityScore;
};

export type SeoChangeRecord = {
  _id: string;
  runId: string;
  field: string;
  changeType: string;
  before: string;
  after: string;
  reason: string;
  confidence: Confidence;
  mode: "suggest" | "auto";
  reverted: boolean;
  createdAt: string;
};

export function analyzeArticleAgent(slug: string) {
  return api<ArticleAnalysis>(`/seo/article/${slug}/analyze`, { method: "POST", json: {} });
}

export function applyAgentChanges(slug: string, changes: ChangeProposal[], mode: "suggest" | "auto" = "suggest") {
  return api<{ applied: number; runId: string }>(`/seo/article/${slug}/apply`, {
    method: "POST",
    json: { changes, mode },
  });
}

export function getArticleHistory(slug: string) {
  return api<SeoChangeRecord[]>(`/seo/article/${slug}/history`);
}

export function revertAgentRun(slug: string, runId: string) {
  return api<{ reverted: number }>(`/seo/article/${slug}/revert`, {
    method: "POST",
    json: { runId },
  });
}
