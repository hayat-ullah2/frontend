import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";
import { env, isProd } from "../config/env.js";

// Used for both `res.cookie()` and `res.clearCookie()`. The browser will only
// drop a cookie on clear if the options (sameSite / secure / path) match what
// was sent on set — otherwise it treats them as different cookies and keeps
// the old one. `maxAge` is intentionally excluded from clear.
//
// SameSite=None (cross-site frontend/API in prod) REQUIRES Secure=true.
const COOKIE_BASE = {
  httpOnly: true,
  secure: env.cookieSameSite === "none" ? true : isProd,
  sameSite: env.cookieSameSite,
  path: "/",
};

function cookieOptions() {
  return { ...COOKIE_BASE, maxAge: 7 * 24 * 60 * 60 * 1000 };
}

export async function signup(req: Request, res: Response) {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("Email already registered");

  const user = await User.create({ name, email, password });
  const token = signToken({ sub: String(user._id), role: user.role });

  res.cookie("token", token, cookieOptions());
  res.status(201).json({
    success: true,
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");

  const token = signToken({ sub: String(user._id), role: user.role });
  res.cookie("token", token, cookieOptions());

  res.json({
    success: true,
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    },
  });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", COOKIE_BASE);
  res.json({ success: true });
}

export async function me(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const user = await User.findById(req.user.sub);
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, data: user });
}
