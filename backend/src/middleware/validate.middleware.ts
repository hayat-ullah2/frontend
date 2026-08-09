import type { NextFunction, Request, Response } from "express";
import { validationResult, type ValidationChain } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const validate =
  (chains: ValidationChain[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    await Promise.all(chains.map((c) => c.run(req)));
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    return next(ApiError.badRequest("Validation failed", result.array()));
  };
