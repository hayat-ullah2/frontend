import { Router } from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import {
  analyzeArticle,
  applyChanges,
  getArticleRankings,
  getAudit,
  getCannibalization,
  getClusters,
  getHistory,
  getInternalLinks,
  getOverview,
  getRankings,
  getSettings,
  researchKeywords,
  revertChange,
} from "../controllers/seo.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// The whole SEO Agent surface is staff-only.
const staff = [authRequired, requireRole("admin", "editor", "writer")];
// Mutations (apply/revert) are admin/editor only.
const editors = [authRequired, requireRole("admin", "editor")];

// Heavier analysis endpoints get their own throttle.
const seoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many SEO requests. Please slow down." } },
});

router.get("/overview", ...staff, asyncHandler(getOverview));
router.get("/audit", ...staff, asyncHandler(getAudit));
router.get("/cannibalization", ...staff, asyncHandler(getCannibalization));
router.get("/clusters", ...staff, asyncHandler(getClusters));
router.get("/rankings", ...staff, asyncHandler(getRankings));
router.get("/settings", ...staff, asyncHandler(getSettings));

router.post(
  "/keywords/research",
  ...staff,
  seoLimiter,
  validate([body("topic").optional().isString(), body("keyword").optional().isString()]),
  asyncHandler(researchKeywords),
);

// Per-article endpoints.
router.get("/article/:slug/internal-links", ...staff, asyncHandler(getInternalLinks));
router.get("/article/:slug/rankings", ...staff, asyncHandler(getArticleRankings));
router.get("/article/:slug/history", ...staff, asyncHandler(getHistory));
router.post("/article/:slug/analyze", ...staff, seoLimiter, asyncHandler(analyzeArticle));
router.post("/article/analyze", ...staff, seoLimiter, asyncHandler(analyzeArticle));
router.post(
  "/article/:slug/apply",
  ...editors,
  validate([body("changes").isArray({ min: 1 })]),
  asyncHandler(applyChanges),
);
router.post(
  "/article/:slug/revert",
  ...editors,
  asyncHandler(revertChange),
);

export default router;
