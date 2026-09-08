import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { Category } from "../models/Category.js";
import { Post } from "../models/Post.js";
import { SeoChange } from "../models/SeoChange.js";
import { ApiError } from "../utils/ApiError.js";
import { revalidatePaths } from "../utils/revalidate.js";
import { analyzeSeo } from "../utils/seo/engine.js";
import { isAiConfigured } from "../services/ai/index.js";
import { providerStatus } from "../services/seo/providers/index.js";
import { postToSeoInput, postToSeoPostLike } from "../services/seo/postMapping.js";
import { detectCannibalization } from "../services/seo/intelligence/cannibalization.js";
import { suggestInternalLinks } from "../services/seo/intelligence/internalLinks.js";
import { buildClusters } from "../services/seo/intelligence/clusters.js";
import { auditLibrary, type AuditItem } from "../services/seo/intelligence/audit.js";
import { buildSiteProfile } from "../services/seo/intelligence/siteProfile.js";
import { computeOpportunityScore } from "../services/seo/intelligence/opportunity.js";
import { topicTokens, tokenize, jaccard } from "../services/seo/intelligence/shared.js";
import {
  computeSafeChanges,
  type ChangeProposal,
} from "../services/seo/autoOptimize.js";
import {
  getPageRankings,
  getQuickWins,
  getSiteTotals,
} from "../services/seo/searchConsoleQueries.js";

// Fields needed by the intelligence layer, kept lean for library-wide scans.
const LIST_FIELDS =
  "title slug excerpt content status primaryKeyword secondaryKeywords searchIntent contentCluster seoScore updatedAt publishedAt";

async function loadLibrary(includeUnpublished = true) {
  const filter = includeUnpublished
    ? { status: { $in: ["published", "draft", "scheduled"] } }
    : { status: "published" };
  const posts = await Post.find(filter)
    .select(LIST_FIELDS)
    .populate("category", "name slug")
    .limit(2000)
    .lean();
  return posts.map(postToSeoPostLike);
}

const SITE_HOST = (() => {
  try {
    return new URL(env.frontendUrl).host;
  } catch {
    return "nexversal.com";
  }
})();

function pageUrlFor(slug: string): string {
  return `${env.frontendUrl.replace(/\/$/, "")}/blog/${slug}`;
}

// ── Overview ──────────────────────────────────────────────────────────────────

export async function getOverview(_req: Request, res: Response) {
  const [libraryDocs, categoryCount] = await Promise.all([
    Post.find({ status: { $in: ["published", "draft", "scheduled"] } })
      .select(LIST_FIELDS)
      .populate("category", "name slug")
      .limit(2000)
      .lean(),
    Category.countDocuments({}),
  ]);
  const library = libraryDocs.map(postToSeoPostLike);

  // Live analysis for accurate aggregate health.
  const items: AuditItem[] = libraryDocs.map((p) => ({
    post: postToSeoPostLike(p),
    analysis: analyzeSeo(postToSeoInput(p)),
  }));
  const audit = auditLibrary(items);

  // Real Search Console totals when connected; null → "Data unavailable".
  const gsc = await getSiteTotals().catch(() => null);
  const profile = buildSiteProfile(SITE_HOST, library, categoryCount, gsc);

  res.json({
    success: true,
    data: {
      profile,
      health: {
        avgScore: audit.avgScore,
        scoring80Plus: audit.scoring80Plus,
        scoringBelow60: audit.scoringBelow60,
        errorCount: audit.errorCount,
        warningCount: audit.warningCount,
      },
      providers: providerStatus(),
      aiConfigured: isAiConfigured(),
    },
  });
}

// ── Site audit ──────────────────────────────────────────────────────────────

export async function getAudit(_req: Request, res: Response) {
  const docs = await Post.find({ status: { $in: ["published", "draft", "scheduled"] } })
    .select(LIST_FIELDS)
    .populate("category", "name slug")
    .limit(2000)
    .lean();
  const items: AuditItem[] = docs.map((p) => ({
    post: postToSeoPostLike(p),
    analysis: analyzeSeo(postToSeoInput(p)),
  }));
  res.json({ success: true, data: auditLibrary(items) });
}

// ── Cannibalization ───────────────────────────────────────────────────────────

export async function getCannibalization(req: Request, res: Response) {
  const library = await loadLibrary();
  const slug = req.query.slug as string | undefined;
  if (slug) {
    const target = library.find((p) => p.slug === slug);
    if (!target) throw ApiError.notFound("Post not found");
    return res.json({
      success: true,
      data: detectCannibalization(library, { target }),
      meta: { source: "nexversal-internal" },
    });
  }
  res.json({
    success: true,
    data: detectCannibalization(library),
    meta: { source: "nexversal-internal" },
  });
}

// ── Internal links ────────────────────────────────────────────────────────────

export async function getInternalLinks(req: Request, res: Response) {
  const library = await loadLibrary();
  const source = library.find((p) => p.slug === req.params.slug);
  if (!source) throw ApiError.notFound("Post not found");
  res.json({
    success: true,
    data: suggestInternalLinks(source, library),
    meta: { source: "nexversal-internal" },
  });
}

// ── Clusters ──────────────────────────────────────────────────────────────────

export async function getClusters(_req: Request, res: Response) {
  const library = await loadLibrary();
  res.json({ success: true, data: buildClusters(library), meta: { source: "nexversal-internal" } });
}

// ── Rankings (Search Console) ──────────────────────────────────────────────────

export async function getRankings(_req: Request, res: Response) {
  const quickWins = await getQuickWins().catch((e) => ({
    available: false as const,
    source: "unavailable" as const,
    note: (e as Error).message,
  }));
  res.json({ success: true, data: quickWins });
}

export async function getArticleRankings(req: Request, res: Response) {
  const post = await Post.findOne({ slug: req.params.slug }).select("slug").lean();
  if (!post) throw ApiError.notFound("Post not found");
  const result = await getPageRankings(pageUrlFor(post.slug)).catch((e) => ({
    available: false as const,
    source: "unavailable" as const,
    note: (e as Error).message,
  }));
  res.json({ success: true, data: result });
}

// ── Trends / keyword research (gated — honest "unavailable") ────────────────────

export async function researchKeywords(req: Request, res: Response) {
  const topic = String(req.body.topic ?? req.body.keyword ?? "").trim();
  if (!topic) throw ApiError.badRequest("A topic or keyword is required.");

  // Real internal signal: how relevant is this topic to what Nexversal covers?
  const library = await loadLibrary();
  const topicTok = new Set(tokenize(topic));
  const relevances = library.map((p) => jaccard(topicTok, topicTokens(p)));
  const topicalRelevance = relevances.length ? Math.max(...relevances) : 0;

  // External metrics are unavailable in Phase 1 (no keyword provider connected).
  const opportunity = computeOpportunityScore(
    {
      topicalRelevance,
      keywordWordCount: topic.split(/\s+/).filter(Boolean).length,
    },
    env.seo.domainStage,
  );

  res.json({
    success: true,
    data: {
      topic,
      topicalRelevance: Number((topicalRelevance * 100).toFixed(0)),
      opportunity,
      keywordMetrics: {
        available: false,
        source: "unavailable",
        note: "No keyword-metrics provider connected — search volume / difficulty / CPC unavailable.",
      },
      trend: {
        available: false,
        source: "unavailable",
        note: "No trends provider connected — trend momentum unavailable.",
      },
    },
    meta: { source: "nexversal-internal + ai-recommendation" },
  });
}

// ── Article optimizer (aggregate) ──────────────────────────────────────────────

export async function analyzeArticle(req: Request, res: Response) {
  const slug = req.params.slug ?? (req.body.slug as string | undefined);
  let doc: any;
  if (slug) {
    doc = await Post.findOne({ slug }).populate("category", "name slug").lean();
    if (!doc) throw ApiError.notFound("Post not found");
  } else if (req.body && req.body.title) {
    doc = req.body; // analyze an unsaved draft payload
  } else {
    throw ApiError.badRequest("Provide a slug or an article payload.");
  }

  const input = postToSeoInput(doc);
  const { analysis, proposals } = computeSafeChanges({ ...input, status: doc.status });

  const library = await loadLibrary();
  const target = postToSeoPostLike(doc);
  const cannibalization = detectCannibalization(library, { target }).slice(0, 5);
  const internalLinks = suggestInternalLinks(target, library);

  const relSelf = new Set(tokenize(`${doc.primaryKeyword ?? ""} ${doc.title ?? ""}`));
  const relevances = library
    .filter((p) => p.slug !== target.slug)
    .map((p) => jaccard(relSelf, topicTokens(p)));
  const topicalRelevance = relevances.length ? Math.max(...relevances) : 0.5;
  const opportunity = computeOpportunityScore(
    {
      topicalRelevance,
      keywordWordCount: (doc.primaryKeyword ?? "").split(/\s+/).filter(Boolean).length || null,
    },
    env.seo.domainStage,
  );

  res.json({
    success: true,
    data: { analysis, proposals, cannibalization, internalLinks, opportunity },
    meta: { aiConfigured: isAiConfigured(), source: "nexversal-internal + ai-recommendation" },
  });
}

// ── Apply / revert safe changes (audit-trailed) ─────────────────────────────────

export async function applyChanges(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const post = await Post.findOne({ slug: req.params.slug });
  if (!post) throw ApiError.notFound("Post not found");

  const accepted = (req.body.changes ?? []) as ChangeProposal[];
  if (!Array.isArray(accepted) || accepted.length === 0) {
    throw ApiError.badRequest("No changes provided.");
  }
  const mode = req.body.mode === "auto" ? "auto" : "suggest";

  // Whitelist the only fields the agent may write, and re-derive `before` from
  // the live document (never trust the client for the audit trail's before-value).
  const ALLOWED = new Set(["seo.title", "seo.description", "slug"]);
  const runId = randomUUID();
  const patch: Record<string, unknown> = {};
  const records: any[] = [];

  const liveValue = (field: string): string => {
    if (field === "slug") return post.slug ?? "";
    if (field === "seo.title") return post.seo?.title ?? "";
    if (field === "seo.description") return post.seo?.description ?? "";
    return "";
  };

  for (const c of accepted) {
    if (!ALLOWED.has(c.field)) continue;
    // In auto mode, only apply proposals explicitly flagged auto-safe.
    if (mode === "auto" && !c.autoSafe) continue;
    const before = liveValue(c.field);
    if (before === c.after) continue;
    patch[c.field] = c.after;
    records.push({
      post: post._id,
      runId,
      field: c.field,
      changeType: c.changeType,
      before,
      after: c.after,
      reason: c.reason,
      confidence: c.confidence,
      dataSources: c.dataSources ?? ["nexversal-internal"],
      appliedBy: req.user.sub,
      adminApproved: mode === "suggest", // suggest mode = an admin clicked Accept
      mode,
    });
  }

  if (records.length === 0) throw ApiError.badRequest("Nothing to apply (fields not allowed or unchanged).");

  await Post.updateOne({ _id: post._id }, { $set: patch }, { runValidators: true });
  await SeoChange.insertMany(records);

  const updated = await Post.findById(post._id).populate("category", "slug").lean();
  await revalidatePaths(["/", "/blog", `/blog/${(updated as any)?.slug ?? post.slug}`]).catch(() => {});

  res.json({
    success: true,
    data: { applied: records.length, runId, post: updated },
    meta: { mode },
  });
}

export async function getHistory(req: Request, res: Response) {
  const post = await Post.findOne({ slug: req.params.slug }).select("_id").lean();
  if (!post) throw ApiError.notFound("Post not found");
  const changes = await SeoChange.find({ post: post._id }).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ success: true, data: changes });
}

export async function revertChange(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const post = await Post.findOne({ slug: req.params.slug });
  if (!post) throw ApiError.notFound("Post not found");

  const runId = req.body.runId as string | undefined;
  const changeId = req.body.changeId as string | undefined;
  const filter: Record<string, unknown> = { post: post._id, reverted: false };
  if (runId) filter.runId = runId;
  else if (changeId) filter._id = changeId;
  else throw ApiError.badRequest("Provide a runId or changeId to revert.");

  const changes = await SeoChange.find(filter);
  if (changes.length === 0) throw ApiError.notFound("No matching change to revert.");

  const patch: Record<string, unknown> = {};
  for (const c of changes) patch[c.field] = c.before; // restore the prior value
  await Post.updateOne({ _id: post._id }, { $set: patch }, { runValidators: true });
  await SeoChange.updateMany(filter, { $set: { reverted: true, revertedAt: new Date() } });

  const updated = await Post.findById(post._id).populate("category", "slug").lean();
  await revalidatePaths(["/", "/blog", `/blog/${(updated as any)?.slug ?? post.slug}`]).catch(() => {});

  res.json({ success: true, data: { reverted: changes.length, post: updated } });
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSettings(_req: Request, res: Response) {
  res.json({
    success: true,
    data: {
      providers: providerStatus(),
      aiConfigured: isAiConfigured(),
      strategy: {
        domainStage: env.seo.domainStage,
        targetCountry: env.seo.targetCountry,
        targetLanguage: env.seo.targetLanguage,
      },
    },
  });
}
