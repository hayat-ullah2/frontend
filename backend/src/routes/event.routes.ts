import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  analyticsSummary,
  ingestEvents,
} from "../controllers/event.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Generous, but enough to blunt a script spamming fake events from one IP.
const ingestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many events." } },
});

// Public first-party beacon.
router.post("/", ingestLimiter, asyncHandler(ingestEvents));

// Admin dashboard summary.
router.get("/summary", authRequired, requireRole("admin", "editor"), asyncHandler(analyticsSummary));

export default router;
