import { Router } from "express";
import { dashboardStats } from "../controllers/stats.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get(
  "/dashboard",
  authRequired,
  requireRole("admin", "editor"),
  asyncHandler(dashboardStats),
);

export default router;
