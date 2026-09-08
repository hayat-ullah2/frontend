// Shared helpers + the minimal post shape the intelligence services operate on.
// Everything here is computed from Nexversal's own database — 100% real data,
// no external provider required.

import { stripHtml } from "../../../utils/seo/engine.js";

/** The fields the intelligence layer reads. Compatible with a lean Post projection. */
export type SeoPostLike = {
  _id: unknown;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  status?: string;
  primaryKeyword?: string | null;
  secondaryKeywords?: string[] | null;
  searchIntent?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  contentCluster?: { name?: string | null; pillar?: boolean | null } | null;
  seoScore?: number | null;
  updatedAt?: Date | string | null;
  publishedAt?: Date | string | null;
};

const STOP = new Set([
  "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "with", "best",
  "top", "vs", "versus", "how", "what", "why", "your", "you", "is", "are", "2024",
  "2025", "2026", "guide", "review", "reviews", "ai", "tool", "tools", "software",
]);

/** Lowercased significant tokens from a string (stopwords + short tokens removed). */
export function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

/** A compact "topic fingerprint" for a post: keyword + title + headings tokens. */
export function topicTokens(p: SeoPostLike): Set<string> {
  const headings = extractHeadingText(p.content ?? "");
  const parts = [
    p.primaryKeyword ?? "",
    p.title ?? "",
    (p.secondaryKeywords ?? []).join(" "),
    headings,
  ].join(" ");
  return new Set(tokenize(parts));
}

export function extractHeadingText(html: string): string {
  const out: string[] = [];
  const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(stripHtml(m[2]));
  return out.join(" ");
}

/** Jaccard similarity between two token sets (0..1). */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Normalise a keyword for equality checks. */
export function normKeyword(k?: string | null): string {
  return (k ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function firstBodyText(html: string, words = 150): string {
  return stripHtml(html || "").split(/\s+/).slice(0, words).join(" ");
}
