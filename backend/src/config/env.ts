import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

/**
 * Work out the shared cookie domain so the auth cookie is readable by BOTH the
 * frontend (nexversal.com) and the API (api.nexversal.com). Without this the
 * `token` cookie is host-only to the API subdomain, so the Vercel/Next server
 * rendering an admin page can't read it and can't forward it to the API — which
 * makes server-rendered draft fetches (e.g. the post editor) 404 for staff.
 *
 * Prefer an explicit COOKIE_DOMAIN. Otherwise, in production only, derive it
 * from FRONTEND_URL's apex (`https://nexversal.com` → `.nexversal.com`). Returns
 * undefined for localhost/IP hosts so local dev keeps a host-only cookie.
 */
function resolveCookieDomain(): string | undefined {
  if (process.env.COOKIE_DOMAIN) return process.env.COOKIE_DOMAIN;
  if ((process.env.NODE_ENV ?? "development") !== "production") return undefined;

  const source = process.env.FRONTEND_URL ?? process.env.CLIENT_ORIGIN;
  if (!source) return undefined;
  let host: string;
  try {
    host = new URL(source.split(",")[0].trim()).hostname;
  } catch {
    return undefined;
  }
  // Skip localhost and bare IPs — a Domain attribute is invalid/pointless there.
  if (host === "localhost" || /^[\d.]+$/.test(host) || host.includes(":")) return undefined;
  host = host.replace(/^www\./, "");
  // Need at least an apex like `example.com` to safely scope a parent domain.
  if (host.split(".").length < 2) return undefined;
  return `.${host}`;
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
  // Optional shared cookie domain. Set to ".nexversal.com" when the frontend
  // (nexversal.com) and API (api.nexversal.com) are subdomains of the same site,
  // so the auth cookie is readable by BOTH — required for the Vercel server to
  // forward it to the API on admin/server-rendered pages. Leave unset for
  // localhost (host-only cookie).
  cookieDomain: resolveCookieDomain(),
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

  // Transactional/newsletter email. Everything works WITHOUT a provider — emails
  // are logged to the console instead of sent, so the welcome sequence can be
  // developed and tested before you connect Resend. Set RESEND_API_KEY (and a
  // verified EMAIL_FROM) to actually deliver mail.
  email: {
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.EMAIL_FROM ?? "Nexversal <onboarding@resend.dev>",
    // Shared secret a scheduler (Vercel Cron, etc.) passes to trigger sending.
    cronSecret:
      process.env.EMAIL_CRON_SECRET ?? process.env.REVALIDATE_SECRET ?? "",
  },

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
