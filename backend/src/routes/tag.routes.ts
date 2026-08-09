import { Router } from "express";
import { Tag } from "../models/Tag.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await Tag.find().sort({ postCount: -1, name: 1 });
    res.json({ success: true, data: items });
  }),
);

export default router;
