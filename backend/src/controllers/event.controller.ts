import type { Request, Response } from "express";
import { AffiliateLink } from "../models/AffiliateLink.js";
import { Event, EVENT_TYPES } from "../models/Event.js";
import { Post } from "../models/Post.js";
import { Subscriber } from "../models/Subscriber.js";

type EventType = (typeof EVENT_TYPES)[number];
const VALID = new Set<string>(EVENT_TYPES);

// Affiliate clicks are recorded server-side in the /go redirect — reject them
// here so the public endpoint can't be used to inflate earnings.
const PUBLIC_ALLOWED = new Set<EventType>([
  "pageview",
  "outbound_click",
  "cta_click",
  "product_click",
  "newsletter_signup",
]);

/**
 * Public, unauthenticated event ingest. Accepts a single event or a small
 * batch (from `navigator.sendBeacon`). Silently drops anything invalid — a
 * beacon must never surface an error to the reader.
 */
export async function ingestEvents(req: Request, res: Response) {
  const raw = Array.isArray(req.body?.events)
    ? req.body.events
    : [req.body];

  const sessionId = firstString(req.body?.sessionId);
  const country = countryOf(req);

  const docs = (raw as unknown[])
    .slice(0, 20) // cap batch size
    .map((e) => e as Record<string, unknown>)
    .filter((e) => VALID.has(String(e.type)) && PUBLIC_ALLOWED.has(e.type as EventType))
    .map((e) => ({
      type: e.type as EventType,
      path: clip(firstString(e.path), 512),
      postSlug: clip(firstString(e.postSlug), 200),
      label: clip(firstString(e.label), 160),
      referrer: hostOf(firstString(e.referrer) ?? req.get("referer")),
      country,
      sessionId: clip(firstString(e.sessionId) ?? sessionId, 64),
    }));

  if (docs.length > 0) {
    Event.insertMany(docs, { ordered: false }).catch(() => {});
  }
  // 204 keeps the beacon cheap; body is ignored by sendBeacon anyway.
  res.status(204).end();
}

/**
 * Admin analytics summary for the revenue dashboard. Window defaults to 30 days.
 */
export async function analyticsSummary(req: Request, res: Response) {
  const days = Math.min(365, Math.max(1, Number(req.query.days ?? 30)));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [byType, uniqueVisitors, topLinks, affiliateTotals, subs, newSubs, posts, topPosts] =
    await Promise.all([
      Event.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Event.distinct("sessionId", {
        type: "pageview",
        createdAt: { $gte: since },
        sessionId: { $nin: [null, ""] },
      }).then((ids) => ids.length),
      AffiliateLink.find({ active: true })
        .select("name slug clicks epc earnings")
        .sort({ clicks: -1 })
        .limit(10),
      AffiliateLink.aggregate<{ clicks: number; earnings: number }>([
        {
          $group: {
            _id: null,
            clicks: { $sum: "$clicks" },
            earnings: { $sum: "$earnings" },
          },
        },
      ]),
      Subscriber.countDocuments({ unsubscribedAt: { $exists: false } }),
      Subscriber.countDocuments({ createdAt: { $gte: since } }),
      Post.countDocuments({ status: "published" }),
      Post.find({ status: "published" })
        .select("title slug views likes")
        .sort({ views: -1 })
        .limit(8),
    ]);

  const counts: Record<string, number> = {};
  for (const t of EVENT_TYPES) counts[t] = 0;
  for (const row of byType) counts[row._id] = row.count;

  const totalAffiliateClicks = affiliateTotals[0]?.clicks ?? 0;
  const affiliateEarnings = affiliateTotals[0]?.earnings ?? 0;

  res.json({
    success: true,
    data: {
      windowDays: days,
      traffic: {
        pageviews: counts.pageview,
        uniqueVisitors,
      },
      engagement: {
        outboundClicks: counts.outbound_click,
        ctaClicks: counts.cta_click,
        productClicks: counts.product_click,
        newsletterSignups: counts.newsletter_signup,
      },
      affiliate: {
        clicksInWindow: counts.affiliate_click,
        totalClicks: totalAffiliateClicks,
        earnings: affiliateEarnings,
        epc:
          totalAffiliateClicks > 0
            ? Number((affiliateEarnings / totalAffiliateClicks).toFixed(2))
            : 0,
        topLinks,
      },
      email: {
        subscribers: subs,
        newInWindow: newSubs,
        signupConversion:
          uniqueVisitors > 0
            ? Number(((newSubs / uniqueVisitors) * 100).toFixed(2))
            : 0,
      },
      content: {
        publishedPosts: posts,
        topPosts,
      },
    },
  });
}

// ── helpers ──────────────────────────────────────────────────────────────────

function firstString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function clip(v: string | undefined, max: number): string | undefined {
  return v ? v.slice(0, max) : undefined;
}
function hostOf(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).host;
  } catch {
    return url.slice(0, 512);
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
