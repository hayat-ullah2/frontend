import type { Request, Response } from "express";
import { Category } from "../models/Category.js";
import { Post } from "../models/Post.js";
import { ApiError } from "../utils/ApiError.js";

export async function listCategories(_req: Request, res: Response) {
  const items = await Category.find().sort({ name: 1 });
  res.json({ success: true, data: items });
}

export async function getCategory(req: Request, res: Response) {
  const cat = await Category.findOne({ slug: req.params.slug });
  if (!cat) throw ApiError.notFound("Category not found");
  res.json({ success: true, data: cat });
}

export async function createCategory(req: Request, res: Response) {
  const cat = await Category.create(req.body);
  res.status(201).json({ success: true, data: cat });
}

export async function updateCategory(req: Request, res: Response) {
  const cat = await Category.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!cat) throw ApiError.notFound("Category not found");
  res.json({ success: true, data: cat });
}

export async function deleteCategory(req: Request, res: Response) {
  const cat = await Category.findOne({ slug: req.params.slug });
  if (!cat) throw ApiError.notFound("Category not found");
  const inUse = await Post.countDocuments({ category: cat._id });
  if (inUse > 0) {
    throw ApiError.badRequest(
      `Category is used by ${inUse} post(s). Reassign them first.`,
    );
  }
  await cat.deleteOne();
  res.json({ success: true });
}
