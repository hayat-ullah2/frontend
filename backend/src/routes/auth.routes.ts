import { Router } from "express";
import { body } from "express-validator";
import { login, logout, me, signup } from "../controllers/auth.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/signup",
  validate([
    body("name").isString().trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 8 }),
  ]),
  asyncHandler(signup),
);

router.post(
  "/login",
  validate([
    body("email").isEmail().normalizeEmail(),
    body("password").isString().notEmpty(),
  ]),
  asyncHandler(login),
);

router.post("/logout", asyncHandler(logout));
router.get("/me", authRequired, asyncHandler(me));

export default router;
