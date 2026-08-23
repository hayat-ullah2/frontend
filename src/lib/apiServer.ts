import { cookies } from "next/headers";
import { API_BASE_URL, ApiError } from "./api";

type ApiOk<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiFail = { success: false; error: { message: string; details?: unknown } };

/**
 * Next.js signals "bail out of static rendering" and route navigation
 * (notFound / redirect) by *throwing* a control-flow error tagged with a
 * `digest`. If a `try/catch` swallows one of these, Next can't complete its
 * dynamic-rendering handoff and instead surfaces a hard render error
 * (`DYNAMIC_SERVER_USAGE`). Our `*Safe` helpers must therefore re-throw them.
 */
function isNextControlFlowError(err: unknown): boolean {
  const digest = (err as { digest?: unknown } | null)?.digest;
  return (
    typeof digest === "string" &&
    (digest === "DYNAMIC_SERVER_USAGE" || digest.startsWith("NEXT_"))
  );
}

type FetchOpts = RequestInit & { json?: unknown };

/**
 * Core server fetch. When `auth` is true the caller's cookies are forwarded
 * (per-user, forces dynamic rendering). When false, no cookies are read and the
 * response is cached with ISR — safe to call during static generation.
 */
async function request<T>(
  path: string,
  init: FetchOpts,
  { auth, revalidate }: { auth: boolean; revalidate: number },
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const { json, headers, ...rest } = init;

  let cookieHeader = "";
  if (auth) {
    const jar = await cookies();
    cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    // Auth requests must never be cached (they're per-user); public requests
    // are cached and revalidated on a schedule so pages can be prerendered.
    ...(auth || revalidate <= 0
      ? { cache: "no-store" }
      : { next: { revalidate } }),
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : (rest as RequestInit).body,
  });

  let body: ApiOk<T> | ApiFail | null = null;
  try {
    body = (await res.json()) as ApiOk<T> | ApiFail;
  } catch {
    /* non-json */
  }

  if (!res.ok || !body || body.success === false) {
    const message = body && "error" in body ? body.error.message : res.statusText;
    throw new ApiError(res.status, message || "Request failed");
  }
  return { data: body.data, meta: body.meta };
}

// ── Authenticated (per-user, dynamic) ────────────────────────────────────────

export async function apiServer<T>(path: string, init: FetchOpts = {}): Promise<T> {
  const { data } = await request<T>(path, init, { auth: true, revalidate: 0 });
  return data;
}

export async function apiServerWithMeta<T>(
  path: string,
  init: FetchOpts = {},
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  return request<T>(path, init, { auth: true, revalidate: 0 });
}

export async function apiServerSafe<T>(
  path: string,
  fallback: T,
  init?: FetchOpts,
): Promise<T> {
  try {
    return await apiServer<T>(path, init);
  } catch (err) {
    // Never swallow Next's dynamic-bailout / navigation control-flow errors —
    // doing so turns a clean dynamic-render handoff into a DYNAMIC_SERVER_USAGE
    // crash. Let them propagate so Next can handle them.
    if (isNextControlFlowError(err)) throw err;
    // 401 from /auth/me (and similar) is the *normal* state for anonymous
    // visitors — never log it. Other failures still surface in dev.
    const status = err instanceof ApiError ? err.status : 0;
    if (status !== 401 && process.env.NODE_ENV !== "production") {
      console.warn(`[apiServer] ${path} failed:`, (err as Error).message);
    }
    return fallback;
  }
}

// ── Public (no cookies, cacheable, static-generation safe) ───────────────────

/**
 * Fetch public data without reading cookies. Safe inside `generateStaticParams`,
 * `generateMetadata`, sitemaps, feeds, OG images and ISR page bodies — none of
 * which may touch dynamic request APIs.
 */
export async function apiPublic<T>(
  path: string,
  init: FetchOpts = {},
  revalidate = 300,
): Promise<T> {
  const { data } = await request<T>(path, init, { auth: false, revalidate });
  return data;
}

export async function apiPublicSafe<T>(
  path: string,
  fallback: T,
  init?: FetchOpts,
  revalidate = 300,
): Promise<T> {
  try {
    return await apiPublic<T>(path, init, revalidate);
  } catch (err) {
    if (isNextControlFlowError(err)) throw err;
    const status = err instanceof ApiError ? err.status : 0;
    if (status !== 401 && process.env.NODE_ENV !== "production") {
      console.warn(`[apiPublic] ${path} failed:`, (err as Error).message);
    }
    return fallback;
  }
}
