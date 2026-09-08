// Safe auto-optimization engine.
//
// Produces concrete, reviewable change PROPOSALS for a post's SEO metadata.
// Every proposal is deterministic and derived from the post's own content — it
// NEVER invents facts, pricing, stats, or "we tested" claims, and never rewrites
// body prose. Content-quality gaps (thin intro, missing sections, keyword
// stuffing) are reported as suggestions, not auto-applied.
//
// `autoSafe: true` marks the subset eligible for MODE 2 (auto-apply) — purely
// mechanical metadata fixes. Everything else is suggest-only (MODE 1).

import slugify from "slugify";
import { analyzeSeo, stripHtml, type SeoAnalysis, type SeoInput } from "../../utils/seo/engine.js";
import type { DataSource } from "./providers/types.js";

export type Confidence = "high" | "medium" | "low";
export type Impact = "high" | "medium" | "low";

export type ChangeProposal = {
  field: string; // dot-path on the post, e.g. "seo.title"
  changeType: "title" | "meta-description" | "slug" | "alt-text" | "faq" | "other";
  before: string;
  after: string;
  reason: string;
  confidence: Confidence;
  impact: Impact;
  autoSafe: boolean; // eligible for auto-apply
  dataSources: DataSource[];
};

export type OptimizeInput = SeoInput & {
  /** Current published status — we never auto-change a live slug. */
  status?: string;
};

function trimToLength(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–]+$/, "");
}

/** Compute the deterministic, non-fabricating change proposals for a post. */
export function computeSafeChanges(input: OptimizeInput): {
  analysis: SeoAnalysis;
  proposals: ChangeProposal[];
} {
  const analysis = analyzeSeo(input);
  const proposals: ChangeProposal[] = [];

  const title = (input.title ?? "").trim();
  const metaTitle = (input.metaTitle ?? "").trim();
  const metaDescription = (input.metaDescription ?? "").trim();
  const excerpt = (input.excerpt ?? "").trim();
  const slug = (input.slug ?? "").trim();
  const isPublished = input.status === "published";

  // ── Meta title ──────────────────────────────────────────────────────────
  if (!metaTitle && title) {
    proposals.push({
      field: "seo.title",
      changeType: "title",
      before: "",
      after: trimToLength(title, 60),
      reason: "No meta title set — using the post title (Google shows the meta title in results).",
      confidence: "high",
      impact: "high",
      autoSafe: true,
      dataSources: ["nexversal-internal"],
    });
  } else if (metaTitle.length > 60) {
    proposals.push({
      field: "seo.title",
      changeType: "title",
      before: metaTitle,
      after: trimToLength(metaTitle, 60),
      reason: `Meta title is ${metaTitle.length} chars — Google truncates ~60. Trimmed at a word boundary.`,
      confidence: "medium",
      impact: "medium",
      autoSafe: true,
      dataSources: ["nexversal-internal"],
    });
  }

  // ── Meta description ────────────────────────────────────────────────────
  const bodyIntro = stripHtml(input.content ?? "").trim();
  if (!metaDescription) {
    const source = excerpt || bodyIntro;
    if (source) {
      proposals.push({
        field: "seo.description",
        changeType: "meta-description",
        before: "",
        after: trimToLength(source, 155),
        reason: excerpt
          ? "No meta description — generated from the post excerpt."
          : "No meta description — generated from the opening paragraph. Review before publishing.",
        confidence: excerpt ? "high" : "medium",
        impact: "high",
        autoSafe: Boolean(excerpt), // only auto-apply when sourced from a human-written excerpt
        dataSources: ["nexversal-internal"],
      });
    }
  } else if (metaDescription.length > 160) {
    proposals.push({
      field: "seo.description",
      changeType: "meta-description",
      before: metaDescription,
      after: trimToLength(metaDescription, 155),
      reason: `Meta description is ${metaDescription.length} chars — Google truncates ~160. Trimmed at a word boundary.`,
      confidence: "medium",
      impact: "medium",
      autoSafe: true,
      dataSources: ["nexversal-internal"],
    });
  }

  // ── Slug ──────────────────────────────────────────────────────────────────
  const cleanSlug = slugify(title || slug, { lower: true, strict: true });
  if (!slug && title) {
    proposals.push({
      field: "slug",
      changeType: "slug",
      before: "",
      after: cleanSlug,
      reason: "No slug — generated a clean, URL-safe slug from the title.",
      confidence: "high",
      impact: "high",
      autoSafe: true,
      dataSources: ["nexversal-internal"],
    });
  } else if (slug && /[^a-z0-9-]/.test(slug)) {
    proposals.push({
      field: "slug",
      changeType: "slug",
      before: slug,
      after: slugify(slug, { lower: true, strict: true }),
      reason: isPublished
        ? "Slug has non-URL-safe characters. Changing a LIVE URL needs a 301 redirect — review carefully."
        : "Slug has non-URL-safe characters — cleaned.",
      confidence: isPublished ? "low" : "medium",
      impact: "medium",
      // Never auto-change a published URL (SEO risk); suggest-only.
      autoSafe: !isPublished,
      dataSources: ["nexversal-internal"],
    });
  }

  return { analysis, proposals };
}

/**
 * Apply a set of accepted proposals to a post-shaped object, returning the
 * `$set` patch and the per-field change records for the audit trail. Only the
 * fields named in `accepted` are touched.
 */
export function applyProposals(
  accepted: ChangeProposal[],
): { patch: Record<string, string>; records: ChangeProposal[] } {
  const patch: Record<string, string> = {};
  for (const p of accepted) patch[p.field] = p.after;
  return { patch, records: accepted };
}
