import { api } from "./api";
import type { ApiPost } from "./models";
import type { SeoAnalysis } from "./seo/engine";

export type PostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  cover?: string;
  coverPublicId?: string;
  category: string;
  tags?: string[];
  status?: "draft" | "published" | "scheduled";
  publishedAt?: string;
  featured?: boolean;
  trending?: boolean;
  seo?: {
    title?: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
    noindex?: boolean;
  };
  // SEO Content Optimization & Geo-Targeting
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  searchIntent?: "informational" | "commercial" | "transactional" | "navigational";
  targetCountries?: string[];
  targetLanguage?: string;
  contentCluster?: { name?: string; pillar?: boolean };
};

export type ContentBrief = {
  source: "ai" | "heuristic";
  targetKeyword: string;
  searchIntent: string;
  targetCountry: string;
  suggestedTitles: string[];
  suggestedH2s: string[];
  suggestedH3s: string[];
  questionsToAnswer: string[];
  subtopics: string[];
  internalLinkOpportunities: string[];
  suggestedCta: string;
  contentGaps: string[];
};

export type AiSuggestion = { category: string; suggestion: string };

export function createPost(input: PostInput) {
  return api<ApiPost>("/posts", { method: "POST", json: input });
}
export function updatePost(slug: string, input: Partial<PostInput>) {
  return api<ApiPost>(`/posts/${slug}`, { method: "PATCH", json: input });
}
export function deletePost(slug: string) {
  return api<{ success: true }>(`/posts/${slug}`, { method: "DELETE" });
}

// ── SEO ─────────────────────────────────────────────────────────────────────

/** Server-authoritative analysis. The client also runs the same engine locally. */
export function analyzeSeoRemote(input: Partial<PostInput>) {
  return api<SeoAnalysis>("/posts/analyze-seo", { method: "POST", json: input });
}

export function getSeoAnalysis(slug: string) {
  return api<SeoAnalysis>(`/posts/${slug}/seo-analysis`);
}

export function generateBrief(input: Partial<PostInput>) {
  return api<ContentBrief>("/posts/generate-brief", { method: "POST", json: input });
}

export function getAiSuggestions(input: Partial<PostInput>) {
  return api<AiSuggestion[]>("/posts/ai-suggestions", { method: "POST", json: input });
}

export function generateLocalizedVersion(slug: string, country: string) {
  return api<ApiPost>(`/posts/${slug}/localize`, {
    method: "POST",
    json: { country },
  });
}

export type ViewerState = {
  authed: boolean;
  liked: boolean;
  bookmarked: boolean;
  likes: number;
  commentCount: number;
};

/**
 * Client-side view beacon. Records one view for the visit and returns the
 * viewer-relative state (auth + like/bookmark) that the statically-rendered
 * post page can't know at build time.
 */
export function registerView(slug: string) {
  return api<ViewerState>(`/posts/${slug}/view`, { method: "POST" });
}

export function toggleLike(slug: string) {
  return api<{ liked: boolean; likes: number }>(`/posts/${slug}/like`, {
    method: "POST",
  });
}
export function toggleBookmark(slug: string) {
  return api<{ bookmarked: boolean }>(`/posts/${slug}/bookmark`, {
    method: "POST",
  });
}
