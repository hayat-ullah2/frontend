import { Router } from "express";
import {
  deleteUser,
  listUsers,
  publicProfile,
  updateMe,
  updateUser,
  userStats,
} from "../controllers/user.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Public — minimal author profile.
router.get("/:id/profile", asyncHandler(publicProfile));

// Self-update — any authenticated user editing their own profile.
router.patch("/me", authRequired, asyncHandler(updateMe));

// Everything below is admin-only.
router.use(authRequired, requireRole("admin"));

router.get("/", asyncHandler(listUsers));
router.get("/stats", asyncHandler(userStats));
router.patch("/:id", asyncHandler(updateUser));
router.delete("/:id", asyncHandler(deleteUser));

export default router;
