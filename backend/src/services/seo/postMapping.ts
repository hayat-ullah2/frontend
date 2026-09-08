// Maps a Mongoose Post document (optionally with `category` populated) to the
// two shapes the SEO layer consumes: the engine's `SeoInput` and the
// intelligence layer's `SeoPostLike`.

import { env } from "../../config/env.js";
import type { SeoInput } from "../../utils/seo/engine.js";
import type { SeoPostLike } from "./intelligence/shared.js";

const SITE_HOST = (() => {
  try {
    return new URL(env.frontendUrl).host;
  } catch {
    return undefined;
  }
})();

type AnyPost = Record<string, any>;

function categoryFields(p: AnyPost): { name: string | null; slug: string | null } {
  const c = p.category;
  if (c && typeof c === "object" && "name" in c) {
    return { name: c.name ?? null, slug: c.slug ?? null };
  }
  return { name: null, slug: null };
}

export function postToSeoInput(p: AnyPost): SeoInput {
  const seo = p.seo ?? {};
  return {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? undefined,
    content: p.content ?? undefined,
    metaTitle: seo.title ?? undefined,
    metaDescription: seo.description ?? undefined,
    canonical: seo.canonical ?? undefined,
    ogImage: seo.ogImage ?? undefined,
    cover: p.cover ?? undefined,
    primaryKeyword: p.primaryKeyword ?? undefined,
    secondaryKeywords: Array.isArray(p.secondaryKeywords) ? p.secondaryKeywords : [],
    targetCountry: Array.isArray(p.targetCountries) ? p.targetCountries[0] : undefined,
    targetLanguage: p.targetLanguage ?? undefined,
    siteHost: SITE_HOST,
  };
}

export function postToSeoPostLike(p: AnyPost): SeoPostLike {
  const cat = categoryFields(p);
  return {
    _id: p._id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? null,
    content: p.content ?? null,
    status: p.status,
    primaryKeyword: p.primaryKeyword ?? null,
    secondaryKeywords: p.secondaryKeywords ?? null,
    searchIntent: p.searchIntent ?? null,
    categoryName: cat.name,
    categorySlug: cat.slug,
    contentCluster: p.contentCluster ?? null,
    seoScore: p.seoScore ?? null,
    updatedAt: p.updatedAt ?? null,
    publishedAt: p.publishedAt ?? null,
  };
}
