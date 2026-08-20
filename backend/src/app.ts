import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env, isProd } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import "./models/index.js"; // register all Mongoose models
import routes from "./routes/index.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin.split(",").map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.cookieSecret));
  app.use(compression());
  app.use(morgan(isProd ? "combined" : "dev"));

  // ── SEO: this API subdomain must never be indexed ─────────────────────────
  // Googlebot discovers api.nexversal.com from the frontend JS bundle (the
  // NEXT_PUBLIC_API_BASE_URL value is compiled into it) and crawls the bare
  // domain. Previously `/` fell through to notFoundHandler → 404, which
  // surfaced in Search Console as "Not found (404)". Tag every response
  // noindex so nothing here can enter the search index, steer crawlers away
  // from the JSON endpoints via robots.txt, and answer the root with a 200 so
  // the 404 report clears.
  app.use((_req, res, next) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
  });

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send("User-agent: *\nDisallow: /api/\n");
  });

  app.get("/", (_req, res) => {
    res.json({ success: true, service: "nexblog-api", docs: "/api/health" });
  });

  // Strict limiter for auth endpoints: prevents brute-force on login/signup.
  // 60 attempts per 15 min from a single IP is plenty for real users while
  // still stopping password spraying.
  app.use(
    "/api/auth",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 60,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: { message: "Too many auth attempts. Try again in a few minutes." } },
    }),
  );

  // General API limiter: applies only to writes (POST/PATCH/PUT/DELETE).
  // GETs are unlimited so page loads, search, and pagination never get
  // throttled. The previous all-method 300/15min cap was too tight and broke
  // normal browsing.
  app.use(
    "/api",
    rateLimit({
      windowMs: env.rateLimitWindowMs,
      max: env.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.method === "GET" || req.method === "HEAD",
      message: { success: false, error: { message: "Too many requests. Please slow down." } },
    }),
  );

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
