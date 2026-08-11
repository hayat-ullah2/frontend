import { Router } from "express";
import { body } from "express-validator";
import {
  createAffiliateLink,
  deleteAffiliateLink,
  listAffiliateLinks,
  listPublicAffiliateLinks,
  registerAffiliateClick,
  updateAffiliateLink,
} from "../controllers/affiliate.controller.js";
import { authOptional, authRequired, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const canManage = [authRequired, requireRole("admin", "editor")];

// Public: safe product cards + the tracked-click resolver used by /go/:slug.
router.get("/public", asyncHandler(listPublicAffiliateLinks));
router.post("/:slug/click", authOptional, asyncHandler(registerAffiliateClick));

// Admin: full management (includes destination URLs and earnings).
router.get("/", ...canManage, asyncHandler(listAffiliateLinks));
router.post(
  "/",
  ...canManage,
  validate([
    body("name").isString().trim().notEmpty().withMessage("Name is required"),
    body("url").isURL({ require_protocol: true }).withMessage("A valid destination URL is required"),
    body("rating").optional({ values: "falsy" }).isFloat({ min: 0, max: 5 }),
    body("pros").optional().isArray({ max: 12 }),
    body("cons").optional().isArray({ max: 12 }),
    body("useCases").optional().isArray({ max: 12 }),
  ]),
  asyncHandler(createAffiliateLink),
);
router.patch(
  "/:slug",
  ...canManage,
  validate([
    body("url").optional().isURL({ require_protocol: true }),
    body("rating").optional({ values: "falsy" }).isFloat({ min: 0, max: 5 }),
  ]),
  asyncHandler(updateAffiliateLink),
);
router.delete("/:slug", ...canManage, asyncHandler(deleteAffiliateLink));

export default router;
