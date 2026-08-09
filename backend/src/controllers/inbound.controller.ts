import type { Request, Response } from "express";
import { ContactMessage } from "../models/ContactMessage.js";
import { Subscriber } from "../models/Subscriber.js";
import { ApiError } from "../utils/ApiError.js";

export async function subscribe(req: Request, res: Response) {
  const { email, source } = req.body as { email: string; source?: string };
  try {
    const sub = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $set: { source: source ?? "site", unsubscribedAt: undefined } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res
      .status(201)
      .json({ success: true, data: { id: sub._id, email: sub.email } });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      throw ApiError.conflict("Email already subscribed");
    }
    throw err;
  }
}

export async function submitContact(req: Request, res: Response) {
  const msg = await ContactMessage.create(req.body);
  res.status(201).json({ success: true, data: { id: msg._id } });
}

export async function listSubscribers(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50)));
  const [items, total] = await Promise.all([
    Subscriber.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Subscriber.countDocuments(),
  ]);
  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function listContactMessages(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50)));
  const [items, total] = await Promise.all([
    ContactMessage.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ContactMessage.countDocuments(),
  ]);
  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
