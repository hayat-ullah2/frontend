import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongoUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/nexblog"),
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  cookieSecret: process.env.COOKIE_SECRET ?? "dev-cookie-secret",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  // Auth-cookie SameSite policy. When the frontend and API are on different
  // domains in production (e.g. Vercel + Railway), cookies MUST be
  // `SameSite=None; Secure` or the browser drops them on cross-site requests.
  // Defaults to "none" in production, "lax" in dev. Override with COOKIE_SAMESITE.
  cookieSameSite: (process.env.COOKIE_SAMESITE ??
    (process.env.NODE_ENV === "production" ? "none" : "lax")) as
    | "none"
    | "lax"
    | "strict",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 300),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER ?? "nexblog",
  },
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  revalidateSecret: process.env.REVALIDATE_SECRET ?? "",

  // Optional AI provider for SEO briefs / suggestions / localized drafts.
  // Everything works WITHOUT this via local heuristics — AI only adds
  // semantic suggestions. Keys live server-side only, never sent to the browser.
  ai: {
    provider: (process.env.AI_PROVIDER ?? "none") as
      | "none"
      | "openai"
      | "claude"
      | "gemini",
    apiKey: process.env.AI_API_KEY ?? "",
    model: process.env.AI_MODEL ?? "",
  },
};

export const isProd = env.nodeEnv === "production";
