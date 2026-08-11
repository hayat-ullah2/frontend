import { Router } from "express";
import { body } from "express-validator";
import {
  listContactMessages,
  listSubscribers,
  processWelcomeSequence,
  submitContact,
  subscribe,
  unsubscribe,
} from "../controllers/inbound.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/subscribers",
  validate([
    body("email").isEmail().normalizeEmail(),
    body("name").optional().isString().trim().isLength({ max: 160 }),
    body("source").optional().isString().trim().isLength({ max: 80 }),
    body("leadMagnet").optional().isString().trim().isLength({ max: 120 }),
  ]),
  asyncHandler(subscribe),
);

router.post(
  "/subscribers/unsubscribe",
  validate([body("email").isEmail().normalizeEmail()]),
  asyncHandler(unsubscribe),
);

// Scheduler hook — protected by a shared secret inside the controller.
router.post("/email/process-sequence", asyncHandler(processWelcomeSequence));

router.post(
  "/contact",
  validate([
    body("name").isString().trim().isLength({ min: 1, max: 120 }),
    body("email").isEmail().normalizeEmail(),
    body("message").isString().trim().isLength({ min: 5, max: 5000 }),
    body("subject").optional().isString().trim().isLength({ max: 200 }),
    body("topic").optional().isIn(["general", "pitch", "partnerships", "press", "corrections"]),
  ]),
  asyncHandler(submitContact),
);

router.get(
  "/subscribers",
  authRequired,
  requireRole("admin", "editor"),
  asyncHandler(listSubscribers),
);
router.get(
  "/contact",
  authRequired,
  requireRole("admin", "editor"),
  asyncHandler(listContactMessages),
);

export default router;
