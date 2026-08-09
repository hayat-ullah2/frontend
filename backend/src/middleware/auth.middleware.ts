import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken, type JwtPayload } from "../utils/jwt.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function readToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  const tokenFromHeader = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const tokenFromCookie = (req as Request & { cookies?: Record<string, string> }).cookies
    ?.token;
  return tokenFromHeader ?? tokenFromCookie;
}

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) return next(ApiError.unauthorized("Missing access token"));
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

/**
 * Like authRequired but never throws — if a valid token is present, sets
 * req.user; otherwise just continues. Use on public routes that *might* want
 * to know who the viewer is (e.g. for per-viewer flags like `viewerLiked`).
 */
export function authOptional(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) return next();
  try {
    req.user = verifyToken(token);
  } catch {
    // bad/expired token — treat as anonymous, don't block the request
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}
