import type { Request, Response } from "express";
import { AffiliateLink } from "../models/AffiliateLink.js";
import { Event } from "../models/Event.js";
import { Post } from "../models/Post.js";
import { ApiError } from "../utils/ApiError.js";

// Fields safe to expose on the public site. `url` (the affiliate destination),
// createdBy and the earnings figures are intentionally excluded.
const PUBLIC_FIELDS =
  "name slug vendor logo niche tagline description pricingNote rating badge pros cons useCases ctaLabel isAffiliate active";

/** Admin: full list including destination URLs and earnings. */
export async function listAffiliateLinks(req: Request, res: Response) {
  const includeInactive = req.query.all === "1" || req.query.all === "true";
  const filter = includeInactive ? {} : { active: true };
  const items = await AffiliateLink.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}

/** Public: active links only, safe fields only (used to embed product cards). */
export async function listPublicAffiliateLinks(_req: Request, res: Response) {
  const items = await AffiliateLink.find({ active: true })
    .select(PUBLIC_FIELDS)
    .sort({ rating: -1, createdAt: -1 });
  res.json({ success: true, data: items });
}

export async function createAffiliateLink(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  try {
    const link = await AffiliateLink.create({
      ...req.body,
      createdBy: req.user.sub,
    });
    res.status(201).json({ success: true, data: link });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      throw ApiError.conflict("An affiliate link with that slug already exists.");
    }
    throw err;
  }
}

export async function updateAffiliateLink(req: Request, res: Response) {
  // Never let the slug be blanked out via a partial update.
  const patch = { ...req.body };
  if ("slug" in patch && !patch.slug) delete patch.slug;

  const link = await AffiliateLink.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: patch },
    { new: true, runValidators: true },
  );
  if (!link) throw ApiError.notFound("Affiliate link not found");
  res.json({ success: true, data: link });
}

export async function deleteAffiliateLink(req: Request, res: Response) {
  const link = await AffiliateLink.findOne({ slug: req.params.slug });
  if (!link) throw ApiError.notFound("Affiliate link not found");

  // Detach from any posts that reference it so we don't leave dangling refs.
  await Post.updateMany(
    { affiliateLinks: link._id },
    { $pull: { affiliateLinks: link._id } },
  );
  await link.deleteOne();
  res.json({ success: true });
}

/**
 * Called server-side by the frontend `/go/:slug` route. Records the click,
 * bumps the counter and returns the destination URL. `authOptional` upstream —
 * we don't need to know who clicked, only that a click happened.
 */
export async function registerAffiliateClick(req: Request, res: Response) {
  const link = await AffiliateLink.findOneAndUpdate(
    { slug: req.params.slug, active: true },
    { $inc: { clicks: 1 } },
    { new: true },
  );
  if (!link) throw ApiError.notFound("Affiliate link not found");

  // Best-effort event log — never block the redirect on analytics.
  Event.create({
    type: "affiliate_click",
    affiliateLink: link._id,
    label: link.name,
    postSlug: typeof req.query.from === "string" ? req.query.from : undefined,
    referrer: hostOf(req.get("referer")),
    country: countryOf(req),
    sessionId: typeof req.query.sid === "string" ? req.query.sid : undefined,
  }).catch(() => {});

  res.json({ success: true, data: { url: link.url, name: link.name } });
}

function hostOf(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

function countryOf(req: Request): string | undefined {
  return (
    (req.get("cf-ipcountry") ||
      req.get("x-vercel-ip-country") ||
      req.get("x-country")) ??
    undefined
  );
}
