// Unit tests for the SEO Agent's pure intelligence functions. No DB / network.
// Run: npm run test:seo   (or: npx tsx src/services/seo/seo.test.ts)
import assert from "node:assert/strict";
import test from "node:test";
import { detectCannibalization } from "./intelligence/cannibalization.js";
import { suggestInternalLinks } from "./intelligence/internalLinks.js";
import { buildClusters } from "./intelligence/clusters.js";
import { computeOpportunityScore } from "./intelligence/opportunity.js";
import { computeSafeChanges } from "./autoOptimize.js";
import type { SeoPostLike } from "./intelligence/shared.js";

function post(p: Partial<SeoPostLike> & { _id: string; title: string; slug: string }): SeoPostLike {
  return {
    excerpt: null,
    content: null,
    status: "published",
    primaryKeyword: null,
    secondaryKeywords: null,
    searchIntent: null,
    categoryName: null,
    categorySlug: null,
    contentCluster: null,
    seoScore: 70,
    updatedAt: null,
    publishedAt: null,
    ...p,
  };
}

// ── Cannibalization ─────────────────────────────────────────────────────────

test("cannibalization: flags two articles with the same primary keyword", () => {
  const posts = [
    post({ _id: "1", title: "Cursor vs Windsurf: Which Editor Wins", slug: "cursor-windsurf", primaryKeyword: "cursor windsurf comparison", searchIntent: "commercial" }),
    post({ _id: "2", title: "Cursor vs Windsurf Compared for Teams", slug: "cursor-windsurf-teams", primaryKeyword: "cursor windsurf comparison", searchIntent: "commercial" }),
  ];
  const pairs = detectCannibalization(posts);
  assert.equal(pairs.length, 1);
  assert.ok(["high", "medium"].includes(pairs[0].risk));
  assert.ok(pairs[0].reasons.some((r) => r.toLowerCase().includes("primary keyword")));
});

test("cannibalization: distinct topics produce no pairs", () => {
  const posts = [
    post({ _id: "1", title: "Email Marketing Platforms Ranked", slug: "email", primaryKeyword: "email marketing platforms" }),
    post({ _id: "2", title: "Video Editing Applications Compared", slug: "video", primaryKeyword: "video editing applications" }),
  ];
  assert.equal(detectCannibalization(posts).length, 0);
});

// ── Internal links ────────────────────────────────────────────────────────────

test("internal links: prefers same-cluster and skips already-linked targets", () => {
  const source = post({
    _id: "1",
    title: "Debugging Python With Copilot",
    slug: "debug-python-copilot",
    primaryKeyword: "python debugging copilot",
    contentCluster: { name: "AI Coding", pillar: false },
    content: '<p>See <a href="/blog/already-linked">this</a>.</p>',
  });
  const library = [
    source,
    post({ _id: "2", title: "Copilot Debugging Workflows Explained", slug: "copilot-workflows", primaryKeyword: "copilot debugging workflows", contentCluster: { name: "AI Coding", pillar: false } }),
    post({ _id: "3", title: "Copilot Python Tips", slug: "already-linked", primaryKeyword: "python copilot" }),
    post({ _id: "4", title: "Gardening In Winter", slug: "gardening", primaryKeyword: "winter gardening" }),
  ];
  const out = suggestInternalLinks(source, library);
  const slugs = out.map((s) => s.targetSlug);
  assert.ok(slugs.includes("copilot-workflows"), "should suggest the same-cluster article");
  assert.ok(!slugs.includes("already-linked"), "must not re-suggest an already-linked target");
  assert.ok(!slugs.includes("gardening"), "must not suggest an unrelated article");
});

// ── Clusters ──────────────────────────────────────────────────────────────────

test("clusters: groups by contentCluster and marks an explicit pillar", () => {
  const posts = [
    post({ _id: "1", title: "AI Coding Pillar", slug: "pillar", contentCluster: { name: "AI Coding", pillar: true }, seoScore: 60 }),
    post({ _id: "2", title: "Supporting A", slug: "a", contentCluster: { name: "AI Coding", pillar: false }, seoScore: 90 }),
  ];
  const clusters = buildClusters(posts);
  const c = clusters.find((x) => x.name === "AI Coding")!;
  assert.equal(c.size, 2);
  assert.equal(c.hasPillar, true);
  assert.equal(c.pillar?.slug, "pillar"); // explicit pillar wins over higher score
});

// ── Opportunity score ───────────────────────────────────────────────────────

test("opportunity: reports missing signals and never invents them", () => {
  const r = computeOpportunityScore({ topicalRelevance: 0.8, keywordWordCount: 5 }, "new");
  assert.ok(r.score > 0);
  assert.equal(r.label, "AI recommendation");
  assert.ok(r.missing.includes("keyword difficulty"));
  assert.ok(r.missing.includes("search volume"));
});

test("opportunity: with no signals at all, score is 0", () => {
  const r = computeOpportunityScore({}, "new");
  assert.equal(r.score, 0);
});

// ── Safe auto-optimize ────────────────────────────────────────────────────────

test("autoOptimize: proposes a meta title when missing (auto-safe)", () => {
  const { proposals } = computeSafeChanges({ title: "The Best AI Writing Tools", status: "draft", excerpt: "A practical roundup." });
  const metaTitle = proposals.find((p) => p.field === "seo.title");
  assert.ok(metaTitle, "should propose a meta title");
  assert.equal(metaTitle!.autoSafe, true);
});

test("autoOptimize: never auto-changes a published slug", () => {
  const { proposals } = computeSafeChanges({ title: "Hello", slug: "bad slug!", status: "published" });
  const slug = proposals.find((p) => p.field === "slug");
  assert.ok(slug, "should surface the slug issue");
  assert.equal(slug!.autoSafe, false, "published slug change must be suggest-only");
  assert.equal(slug!.confidence, "low");
});

test("autoOptimize: meta description from excerpt is auto-safe", () => {
  const { proposals } = computeSafeChanges({ title: "T", status: "draft", excerpt: "A concise, human-written summary of the article." });
  const desc = proposals.find((p) => p.field === "seo.description");
  assert.ok(desc);
  assert.equal(desc!.autoSafe, true);
});
