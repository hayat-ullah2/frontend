import { Router } from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import {
  createComment,
  listCommentsForPost,
} from "../controllers/comment.controller.js";
import {
  analyzePostSeo,
  createPost,
  deletePost,
  generateAiSuggestions,
  generateContentBrief,
  generateLocalizedVersion,
  getPost,
  getPostSeoAnalysis,
  listPosts,
  registerView,
  toggleBookmark,
  toggleLike,
  updatePost,
} from "../controllers/post.controller.js";
import {
  authOptional,
  authRequired,
  requireRole,
} from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  isValidCountryCode,
  isValidIntent,
  isValidLanguage,
} from "../utils/seo/geo.js";

const router = Router();

// Optional SEO/geo field validators shared by create + update.
const seoFieldValidators = [
  body("authorName").optional().isString().trim().isLength({ max: 120 }),
  body("primaryKeyword").optional().isString().trim().isLength({ max: 120 }),
  body("secondaryKeywords").optional().isArray({ max: 20 }),
  body("secondaryKeywords.*").optional().isString().trim().isLength({ max: 120 }),
  body("searchIntent")
    .optional({ values: "falsy" })
    .custom((v) => isValidIntent(String(v)))
    .withMessage("Invalid search intent"),
  body("targetCountries").optional().isArray({ max: 12 }),
  body("targetCountries.*")
    .optional()
    .custom((v) => isValidCountryCode(String(v).toLowerCase()))
    .withMessage("Invalid target country"),
  body("targetLanguage")
    .optional({ values: "falsy" })
    .custom((v) => isValidLanguage(String(v)))
    .withMessage("Invalid target language"),
];

// AI / analysis endpoints can be expensive — throttle them per IP.
const seoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many SEO requests. Please slow down." },
  },
});

const canWrite = [authRequired, requireRole("admin", "editor", "writer")];

router.get("/", asyncHandler(listPosts));

// ── SEO endpoints (fixed paths first) ─────────────────────────────────────
router.post("/analyze-seo", ...canWrite, asyncHandler(analyzePostSeo));
router.post("/generate-brief", ...canWrite, seoLimiter, asyncHandler(generateContentBrief));
router.post("/ai-suggestions", ...canWrite, seoLimiter, asyncHandler(generateAiSuggestions));

router.get("/:slug", authOptional, asyncHandler(getPost));
router.get("/:slug/comments", asyncHandler(listCommentsForPost));
router.get("/:slug/seo-analysis", ...canWrite, asyncHandler(getPostSeoAnalysis));

router.post(
  "/:slug/comments",
  authRequired,
  validate([body("content").isString().trim().isLength({ min: 2, max: 4000 })]),
  asyncHandler(createComment),
);

router.post("/:slug/view", authOptional, asyncHandler(registerView));
router.post("/:slug/like", authRequired, asyncHandler(toggleLike));
router.post("/:slug/bookmark", authRequired, asyncHandler(toggleBookmark));
router.post(
  "/:slug/localize",
  ...canWrite,
  seoLimiter,
  validate([body("country").isString().trim().notEmpty()]),
  asyncHandler(generateLocalizedVersion),
);

router.post(
  "/",
  ...canWrite,
  validate([
    body("title").isString().trim().notEmpty(),
    body("content").isString().notEmpty(),
    body("category").isString().notEmpty(),
    ...seoFieldValidators,
  ]),
  asyncHandler(createPost),
);

router.patch(
  "/:slug",
  ...canWrite,
  validate([
    body("title").optional().isString().trim().notEmpty(),
    body("content").optional().isString().notEmpty(),
    ...seoFieldValidators,
  ]),
  asyncHandler(updatePost),
);

router.delete(
  "/:slug",
  authRequired,
  requireRole("admin", "editor"),
  asyncHandler(deletePost),
);

export default router;
