import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { destroyAsset } from "../utils/cloudinary-cleanup.js";

export async function listUsers(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const { q, role, status } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function userStats(_req: Request, res: Response) {
  const [total, active, pending, banned, byRole] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "pending" }),
    User.countDocuments({ status: "banned" }),
    User.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),
  ]);

  const roles: Record<string, number> = {};
  for (const r of byRole) roles[r._id] = r.count;

  res.json({
    success: true,
    data: { total, active, pending, banned, byRole: roles },
  });
}

export async function updateUser(req: Request, res: Response) {
  const { role, status, name, bio, avatar, avatarPublicId } = req.body as Partial<{
    role: string;
    status: string;
    name: string;
    bio: string;
    avatar: string;
    avatarPublicId: string;
  }>;
  const update: Record<string, unknown> = {};
  if (role) update.role = role;
  if (status) update.status = status;
  if (name) update.name = name;
  if (bio !== undefined) update.bio = bio;
  if (avatar !== undefined) update.avatar = avatar;
  if (avatarPublicId !== undefined) update.avatarPublicId = avatarPublicId;

  const existing = await User.findById(req.params.id);
  if (!existing) throw ApiError.notFound("User not found");

  if (
    avatarPublicId !== undefined &&
    existing.avatarPublicId &&
    existing.avatarPublicId !== avatarPublicId
  ) {
    await destroyAsset(existing.avatarPublicId);
  }

  const user = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: user });
}

/**
 * Self-update: any authenticated user editing their own profile.
 * Only allows safe, non-privileged fields (no role, no status).
 */
export async function updateMe(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { name, bio, avatar, avatarPublicId } = req.body as Partial<{
    name: string;
    bio: string;
    avatar: string;
    avatarPublicId: string;
  }>;

  const update: Record<string, unknown> = {};
  if (name) update.name = name;
  if (bio !== undefined) update.bio = bio;
  if (avatar !== undefined) update.avatar = avatar;
  if (avatarPublicId !== undefined) update.avatarPublicId = avatarPublicId;

  const existing = await User.findById(req.user.sub);
  if (!existing) throw ApiError.notFound("User not found");

  if (
    avatarPublicId !== undefined &&
    existing.avatarPublicId &&
    existing.avatarPublicId !== avatarPublicId
  ) {
    await destroyAsset(existing.avatarPublicId);
  }

  const user = await User.findByIdAndUpdate(req.user.sub, update, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: user });
}

export async function publicProfile(req: Request, res: Response) {
  // Public author profile: only safe-to-expose fields.
  // Email and role are intentionally NOT returned — they're internal data.
  // Admin accounts do NOT get a public profile page — pretend they don't exist
  // from a public-author standpoint.
  const user = await User.findById(req.params.id).select(
    "name avatar bio socials createdAt role",
  );
  if (!user || user.role === "admin") throw ApiError.notFound("User not found");

  // Strip role before responding.
  const { role: _role, ...publicData } = user.toObject();
  res.json({ success: true, data: publicData });
}

export async function deleteUser(req: Request, res: Response) {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  await destroyAsset(user.avatarPublicId);
  await user.deleteOne();
  res.json({ success: true });
}
