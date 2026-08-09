import { Router } from "express";
import { body } from "express-validator";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "../controllers/category.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listCategories));
router.get("/:slug", asyncHandler(getCategory));

router.post(
  "/",
  authRequired,
  requireRole("admin", "editor"),
  validate([body("name").isString().trim().notEmpty()]),
  asyncHandler(createCategory),
);

router.patch(
  "/:slug",
  authRequired,
  requireRole("admin", "editor"),
  asyncHandler(updateCategory),
);

router.delete(
  "/:slug",
  authRequired,
  requireRole("admin"),
  asyncHandler(deleteCategory),
);

export default router;
