import type { Request, Response } from "express";
import { Category } from "../models/Category.js";
import { Comment } from "../models/Comment.js";
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";

export async function dashboardStats(_req: Request, res: Response) {
  const [
    totalUsers,
    activeUsers,
    totalPosts,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    totalCategories,
    pendingComments,
    recentPosts,
    recentUsers,
    viewsAgg,
    likesAgg,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "active" }),
    Post.countDocuments(),
    Post.countDocuments({ status: "published" }),
    Post.countDocuments({ status: "draft" }),
    Post.countDocuments({ status: "scheduled" }),
    Category.countDocuments(),
    Comment.countDocuments({ status: "pending" }),
    Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("category", "name slug")
      .populate("author", "name avatar"),
    User.find().sort({ createdAt: -1 }).limit(5),
    Post.aggregate<{ _id: null; total: number }>([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]),
    Post.aggregate<{ _id: null; total: number }>([
      { $group: { _id: null, total: { $sum: "$likes" } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      users: { total: totalUsers, active: activeUsers },
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        scheduled: scheduledPosts,
      },
      categories: { total: totalCategories },
      comments: { pending: pendingComments },
      views: viewsAgg[0]?.total ?? 0,
      likes: likesAgg[0]?.total ?? 0,
      recentPosts,
      recentUsers,
    },
  });
}
