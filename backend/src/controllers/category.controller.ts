import type { Request, Response } from "express";
import { Category } from "../models/Category.js";
import { Post } from "../models/Post.js";
import { ApiError } from "../utils/ApiError.js";
import { revalidatePaths } from "../utils/revalidate.js";

async function publishedCountsByCategory() {
  const counts = await Post.aggregate<{ _id: unknown; postCount: number }>([
    { $match: { status: "published" } },
    { $group: { _id: "$category", postCount: { $sum: 1 } } },
  ]);
  return new Map(counts.map((c) => [String(c._id), c.postCount]));
}

async function revalidateCategorySurfaces(...slugs: (string | undefined)[]) {
  const paths = ["/", "/blog"];
  for (const slug of slugs) {
    if (slug) paths.push(`/category/${slug}`);
  }
  await revalidatePaths(paths);
}

export async function listCategories(_req: Request, res: Response) {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    publishedCountsByCategory(),
  ]);
  const items = categories.map((cat) => ({
    ...cat,
    postCount: counts.get(String(cat._id)) ?? 0,
  }));
  res.json({ success: true, data: items });
}

export async function getCategory(req: Request, res: Response) {
  const cat = await Category.findOne({ slug: req.params.slug }).lean();
  if (!cat) throw ApiError.notFound("Category not found");
  const postCount = await Post.countDocuments({ category: cat._id, status: "published" });
  res.json({ success: true, data: { ...cat, postCount } });
}

export async function createCategory(req: Request, res: Response) {
  const cat = await Category.create(req.body);
  await revalidateCategorySurfaces(cat.slug);
  res.status(201).json({ success: true, data: cat });
}

export async function updateCategory(req: Request, res: Response) {
  const cat = await Category.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!cat) throw ApiError.notFound("Category not found");
  await revalidateCategorySurfaces(req.params.slug, cat.slug);
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
  await revalidateCategorySurfaces(cat.slug);
  res.json({ success: true });
}
