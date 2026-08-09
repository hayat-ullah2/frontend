import type { Request, Response } from "express";
import { Comment } from "../models/Comment.js";
import { Post } from "../models/Post.js";
import { ApiError } from "../utils/ApiError.js";

export async function listComments(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const { status, postId } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (postId) filter.post = postId;

  const [items, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name email avatar")
      .populate("post", "title slug"),
    Comment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function createComment(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const post = await Post.findOne({ slug: req.params.slug });
  if (!post) throw ApiError.notFound("Post not found");

  const comment = await Comment.create({
    post: post._id,
    author: req.user.sub,
    content: req.body.content,
    parent: req.body.parent ?? null,
    status: "pending",
  });
  res.status(201).json({ success: true, data: comment });
}

export async function listCommentsForPost(req: Request, res: Response) {
  const post = await Post.findOne({ slug: req.params.slug });
  if (!post) throw ApiError.notFound("Post not found");
  const items = await Comment.find({ post: post._id, status: "approved" })
    .sort({ createdAt: -1 })
    .populate("author", "name avatar");
  res.json({ success: true, data: items });
}

export async function updateCommentStatus(req: Request, res: Response) {
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { $set: { status: req.body.status } },
    { new: true, runValidators: true },
  );
  if (!comment) throw ApiError.notFound("Comment not found");
  if (req.body.status === "approved") {
    await Post.updateOne({ _id: comment.post }, { $inc: { commentCount: 1 } });
  }
  res.json({ success: true, data: comment });
}

export async function deleteComment(req: Request, res: Response) {
  const result = await Comment.deleteOne({ _id: req.params.id });
  if (result.deletedCount === 0) throw ApiError.notFound("Comment not found");
  res.json({ success: true });
}
