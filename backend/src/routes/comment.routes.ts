import { Router } from "express";
import { body } from "express-validator";
import {
  deleteComment,
  listComments,
  updateCommentStatus,
} from "../controllers/comment.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authRequired, requireRole("admin", "editor"));

router.get("/", asyncHandler(listComments));
router.patch(
  "/:id/status",
  validate([body("status").isIn(["approved", "pending", "flagged", "rejected"])]),
  asyncHandler(updateCommentStatus),
);
router.delete("/:id", asyncHandler(deleteComment));

export default router;
