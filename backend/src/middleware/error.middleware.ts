import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { isProd } from "../config/env.js";

// Errors that mean "the database is unreachable right now, retry later"
const DB_TRANSIENT_CODES = new Set([
  "ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "ECONNREFUSED",
]);

function isTransientDbError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { name?: string; code?: string; message?: string };
  if (e.code && DB_TRANSIENT_CODES.has(e.code)) return true;
  if (e.name === "MongoServerSelectionError") return true;
  if (e.name === "MongoNetworkError") return true;
  if (e.message && /buffering timed out/i.test(e.message)) return true;
  return false;
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  const isApi = err instanceof ApiError;
  let status = isApi ? err.status : 500;
  let message = err instanceof Error ? err.message : "Internal server error";
  const details = isApi ? err.details : undefined;

  if (!isApi && isTransientDbError(err)) {
    status = 503;
    message =
      "Database is temporarily unavailable. The cluster may be waking up — please retry in a few seconds.";
  }

  if (!isApi || status >= 500) {
    console.error("[error]", (err as Error).message ?? err);
  }

  res.status(status).json({
    success: false,
    error: { message, ...(details ? { details } : {}) },
    ...(isProd ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
}
