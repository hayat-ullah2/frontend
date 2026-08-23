import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { Category } from "../models/Category.js";
import { Post } from "../models/Post.js";
import { Tag } from "../models/Tag.js";
import { ApiError } from "../utils/ApiError.js";
import { destroyAsset } from "../utils/cloudinary-cleanup.js";
import { revalidatePaths } from "../utils/revalidate.js";
import { analyzeSeo, type SeoAnalysis, type SeoInput } from "../utils/seo/engine.js";
import {
  buildLocalizedDraft,
  generateBrief,
  generateSuggestions,
} from "../services/seo.service.js";
import { isAiConfigured } from "../services/ai/index.js";

const OBJECT_ID = /^[a-f0-9]{24}$/i;

const SITE_HOST = (() => {
  try {
    return new URL(env.frontendUrl).host;
  } catch {
    return undefined;
  }
})();

/** Map a post-shaped payload to the engine's input contract. */
function toSeoInput(data: Record<string, unknown>): SeoInput {
  const seo = (data.seo ?? {}) as Record<string, unknown>;
  return {
    title: str(data.title),
    slug: str(data.slug),
    excerpt: str(data.excerpt),
    content: str(data.content),
    metaTitle: str(seo.title),
    metaDescription: str(seo.description),
    canonical: str(seo.canonical),
    ogImage: str(seo.ogImage),
    cover: str(data.cover),
    primaryKeyword: str(data.primaryKeyword),
    secondaryKeywords: Array.isArray(data.secondaryKeywords)
      ? (data.secondaryKeywords as unknown[]).map((k) => String(k))
      : [],
    targetCountry: Array.isArray(data.targetCountries)
      ? String((data.targetCountries as unknown[])[0] ?? "")
      : str(data.targetCountries),
    targetLanguage: str(data.targetLanguage),
    siteHost: SITE_HOST,
  };
}

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

/** Persistable analysis snapshot fields derived from an analysis. */
function analysisFields(a: SeoAnalysis) {
  return {
    // Persist the computed read-time on every save so it's never left at 0.
    readingTime: a.metrics.readingTimeMin,
    seoScore: a.score,
    seoScores: {
      keyword: a.categories.keyword.score,
      structure: a.categories.structure.score,
      metadata: a.categories.metadata.score,
      readability: a.categories.readability.score,
      links: a.categories.links.score,
      images: a.categories.images.score,
    },
    seoStatus: a.rating,
    seoIssues: a.issues.map((i) => ({
      id: i.id,
      severity: i.severity,
      category: i.category,
      message: i.message,
    })),
    seoAnalyzedAt: new Date(),
  };
}

async function revalidateForPost(slug: string, ...categorySlugs: (string | undefined)[]) {
  const paths = ["/", "/blog", `/blog/${slug}`];
  for (const categorySlug of new Set(categorySlugs.filter(Boolean))) {
    paths.push(`/category/${categorySlug}`);
  }
  await revalidatePaths(paths);
}

export async function listPosts(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(1000, Math.max(1, Number(req.query.limit ?? 12)));
  const { q, category, tag, status, author } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  else filter.status = "published";

  if (category) {
    if (OBJECT_ID.test(category)) {
      filter.category = category;
    } else {
      const cat = await Category.findOne({ slug: category }).select("_id");
      if (!cat) return res.json({ success: true, data: [], meta: { page, limit, total: 0, pages: 0 } });
      filter.category = cat._id;
    }
  }

  if (tag) {
    if (OBJECT_ID.test(tag)) {
      filter.tags = tag;
    } else {
      const t = await Tag.findOne({ slug: tag }).select("_id");
      if (!t) return res.json({ success: true, data: [], meta: { page, limit, total: 0, pages: 0 } });
      filter.tags = t._id;
    }
  }

  if (author) filter.author = author;
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    Post.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("category", "name slug color")
      .populate("author", "name avatar")
      .populate("tags", "name slug"),
    Post.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function getPost(req: Request, res: Response) {
  const post = await Post.findOne({ slug: req.params.slug })
    .populate("category", "name slug color")
    .populate("author", "name avatar bio socials")
    .populate("tags", "name slug")
    // Never expose the raw affiliate destination URL to the browser — outbound
    // traffic goes through the tracked /go/:slug redirect instead.
    .populate(
      "affiliateLinks",
      "name slug vendor logo niche tagline description pricingNote rating badge pros cons useCases ctaLabel isAffiliate active",
    );
  if (!post) throw ApiError.notFound("Post not found");

  // Only published posts are public. Drafts/scheduled/archived are visible only
  // to authenticated staff (e.g. the admin editor) — so unpublished demo posts
  // return 404 to visitors and drop out of Google. (Task 1a)
  const role = req.user?.role;
  const isStaff = role === "admin" || role === "editor" || role === "writer";
  if (post.status !== "published" && !isStaff) {
    throw ApiError.notFound("Post not found");
  }

  // NB: views are no longer incremented here. The single-post page is rendered
  // statically (ISR), so a server GET happens only on revalidation — not per
  // visitor. Per-visit view counting lives in `registerView` below, which the
  // client calls once on mount.

  // Add per-viewer flags without exposing the full likedBy / bookmarkedBy
  // arrays (those could reveal who else liked what).
  const viewerId = req.user?.sub;
  const json = post.toObject();
  const likedBy = (json.likedBy ?? []) as unknown as string[];
  const bookmarkedBy = (json.bookmarkedBy ?? []) as unknown as string[];
  const viewerLiked = !!viewerId && likedBy.some((id) => String(id) === viewerId);
  const viewerBookmarked =
    !!viewerId && bookmarkedBy.some((id) => String(id) === viewerId);
  delete (json as { likedBy?: unknown }).likedBy;
  delete (json as { bookmarkedBy?: unknown }).bookmarkedBy;

  res.json({ success: true, data: { ...json, viewerLiked, viewerBookmarked } });
}

/**
 * Client-side "a human viewed this post" beacon. Increments the view counter
 * once per visit and returns the viewer-relative state the client needs to
 * hydrate the like/bookmark buttons — none of which can come from the
 * statically-rendered page. `authOptional`: anonymous visitors still count.
 */
export async function registerView(req: Request, res: Response) {
  const post = await Post.findOne({ slug: req.params.slug }).select(
    "likes commentCount likedBy bookmarkedBy",
  );
  if (!post) throw ApiError.notFound("Post not found");

  await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });

  const viewerId = req.user?.sub;
  const likedBy = (post.get("likedBy") ?? []) as unknown as string[];
  const bookmarkedBy = (post.get("bookmarkedBy") ?? []) as unknown as string[];

  res.json({
    success: true,
    data: {
      authed: !!viewerId,
      liked: !!viewerId && likedBy.some((id) => String(id) === viewerId),
      bookmarked:
        !!viewerId && bookmarkedBy.some((id) => String(id) === viewerId),
      likes: post.get("likes") ?? 0,
      commentCount: post.get("commentCount") ?? 0,
    },
  });
}

async function toggleSet(
  slug: string,
  userId: string,
  field: "likedBy" | "bookmarkedBy",
  counter: "likes" | null,
) {
  const post = await Post.findOne({ slug });
  if (!post) throw ApiError.notFound("Post not found");

  const arr = (post.get(field) ?? []) as unknown as string[];
  const has = arr.some((id) => String(id) === userId);

  if (has) {
    await Post.updateOne(
      { _id: post._id },
      counter
        ? { $pull: { [field]: userId }, $inc: { [counter]: -1 } }
        : { $pull: { [field]: userId } },
    );
  } else {
    await Post.updateOne(
      { _id: post._id },
      counter
        ? { $addToSet: { [field]: userId }, $inc: { [counter]: 1 } }
        : { $addToSet: { [field]: userId } },
    );
  }

  const updated = await Post.findById(post._id).select("likes");
  return { active: !has, likes: updated?.likes ?? 0 };
}

export async function toggleLike(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { active, likes } = await toggleSet(
    req.params.slug,
    req.user.sub,
    "likedBy",
    "likes",
  );
  res.json({ success: true, data: { liked: active, likes } });
}

export async function toggleBookmark(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { active } = await toggleSet(
    req.params.slug,
    req.user.sub,
    "bookmarkedBy",
    null,
  );
  res.json({ success: true, data: { bookmarked: active } });
}

export async function createPost(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();

  // Server-authoritative SEO analysis — never trust a score from the browser.
  const analysis = analyzeSeo(toSeoInput(req.body));
  const errors = analysis.issues.filter((i) => i.severity === "error");
  if (req.body.status === "published" && errors.length > 0) {
    throw new ApiError(
      422,
      `Cannot publish: ${errors.length} critical SEO issue${errors.length === 1 ? "" : "s"} must be fixed first. You can still save as a draft.`,
      { seoErrors: errors, seoScore: analysis.score },
    );
  }

  const post = await Post.create({
    ...req.body,
    ...analysisFields(analysis),
    author: req.user.sub,
  });

  // Fire-and-forget: tell the frontend to rebuild the affected pages.
  const cat = post.category
    ? await Category.findById(post.category).select("slug")
    : null;
  await revalidateForPost(post.slug, cat?.slug);

  res.status(201).json({ success: true, data: post });
}

export async function updatePost(req: Request, res: Response) {
  const existing = await Post.findOne({ slug: req.params.slug });
  if (!existing) throw ApiError.notFound("Post not found");
  const previousCat = existing.category
    ? await Category.findById(existing.category).select("slug")
    : null;

  // If the cover image is being replaced (and we have a publicId), clean up the old one.
  if (
    "coverPublicId" in req.body &&
    existing.coverPublicId &&
    existing.coverPublicId !== req.body.coverPublicId
  ) {
    await destroyAsset(existing.coverPublicId);
  }

  // Re-run analysis on the merged (existing + incoming) document so partial
  // updates are scored against the real, complete post.
  const merged = { ...existing.toObject(), ...req.body };
  const analysis = analyzeSeo(toSeoInput(merged as Record<string, unknown>));
  const errors = analysis.issues.filter((i) => i.severity === "error");
  const resultingStatus = req.body.status ?? existing.status;
  if (resultingStatus === "published" && errors.length > 0) {
    throw new ApiError(
      422,
      `Cannot publish: ${errors.length} critical SEO issue${errors.length === 1 ? "" : "s"} must be fixed first. You can still save as a draft.`,
      { seoErrors: errors, seoScore: analysis.score },
    );
  }

  const post = await Post.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: { ...req.body, ...analysisFields(analysis) } },
    { new: true, runValidators: true },
  );
  if (post) {
    const cat = post.category
      ? await Category.findById(post.category).select("slug")
      : null;
    await revalidateForPost(post.slug, previousCat?.slug, cat?.slug);
  }
  res.json({ success: true, data: post });
}

// ── SEO endpoints ───────────────────────────────────────────────────────────

/**
 * Stateless analysis of a post-shaped payload. Used by the admin for the
 * authoritative "Analyze SEO" button (the browser also runs the same engine
 * locally for instant feedback). No id required — analyzes what is sent.
 */
export async function analyzePostSeo(req: Request, res: Response) {
  const analysis = analyzeSeo(toSeoInput(req.body ?? {}));
  res.json({ success: true, data: analysis });
}

/** Return the stored analysis snapshot for an existing post. */
export async function getPostSeoAnalysis(req: Request, res: Response) {
  const post = await Post.findOne({ slug: req.params.slug });
  if (!post) throw ApiError.notFound("Post not found");
  // Recompute live so the snapshot is always current.
  const analysis = analyzeSeo(toSeoInput(post.toObject() as Record<string, unknown>));
  res.json({ success: true, data: analysis });
}

export async function generateContentBrief(req: Request, res: Response) {
  const brief = await generateBrief(toSeoInput(req.body ?? {}));
  res.json({ success: true, data: brief, meta: { aiConfigured: isAiConfigured() } });
}

export async function generateAiSuggestions(req: Request, res: Response) {
  const result = await generateSuggestions(toSeoInput(req.body ?? {}));
  res.json({
    success: true,
    data: result.suggestions,
    meta: { source: result.source, aiConfigured: isAiConfigured() },
  });
}

/**
 * Create a localized DRAFT variant of an existing post for one country.
 * Deterministic + free (spelling/meta/naming). Never mass-publishes.
 */
export async function generateLocalizedVersion(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const country = String(req.body.country ?? "").toLowerCase();
  if (!country) throw ApiError.badRequest("A target country is required.");

  const original = await Post.findOne({ slug: req.params.slug });
  if (!original) throw ApiError.notFound("Post not found");

  const draft = buildLocalizedDraft(
    {
      title: original.title,
      slug: original.slug,
      content: original.content,
      excerpt: original.excerpt ?? undefined,
      seo: original.seo ?? undefined,
      targetLanguage: original.targetLanguage ?? undefined,
    },
    country,
    env.frontendUrl,
  );

  // Guard against duplicates if the admin clicks twice.
  const existing = await Post.findOne({ slug: draft.slug });
  if (existing) {
    throw ApiError.conflict("A localized version with this slug already exists.");
  }

  const post = await Post.create({
    title: draft.title,
    slug: draft.slug,
    content: draft.content,
    excerpt: draft.excerpt,
    cover: original.cover,
    category: original.category,
    tags: original.tags,
    author: req.user.sub,
    status: "draft",
    primaryKeyword: original.primaryKeyword,
    secondaryKeywords: original.secondaryKeywords,
    searchIntent: original.searchIntent,
    targetCountries: draft.targetCountries,
    targetLanguage: draft.targetLanguage,
    localizedFrom: original._id,
    seo: draft.seo,
  });

  res.status(201).json({ success: true, data: post, meta: { notes: draft.notes } });
}

export async function deletePost(req: Request, res: Response) {
  const post = await Post.findOne({ slug: req.params.slug });
  if (!post) throw ApiError.notFound("Post not found");

  const cat = post.category
    ? await Category.findById(post.category).select("slug")
    : null;

  await destroyAsset(post.coverPublicId);
  await post.deleteOne();
  await revalidateForPost(post.slug, cat?.slug);

  res.json({ success: true });
}
