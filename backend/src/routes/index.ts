import { Router } from "express";
import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import commentRoutes from "./comment.routes.js";
import inboundRoutes from "./inbound.routes.js";
import postRoutes from "./post.routes.js";
import statsRoutes from "./stats.routes.js";
import tagRoutes from "./tag.routes.js";
import uploadRoutes from "./upload.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "nexblog-api",
    status: "ok",
    time: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/categories", categoryRoutes);
router.use("/tags", tagRoutes);
router.use("/comments", commentRoutes);
router.use("/users", userRoutes);
router.use("/stats", statsRoutes);
router.use("/uploads", uploadRoutes);
router.use("/", inboundRoutes); // /api/subscribers, /api/contact

export default router;
