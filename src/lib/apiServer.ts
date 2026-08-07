import { cookies } from "next/headers";
import { API_BASE_URL, ApiError } from "./api";

type ApiOk<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiFail = { success: false; error: { message: string; details?: unknown } };

export async function apiServer<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = init;

  const jar = await cookies();
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    cache: "no-store",
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
  return body.data;
}

export async function apiServerSafe<T>(
  path: string,
  fallback: T,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  try {
    return await apiServer<T>(path, init);
  } catch (err) {
    // 401 from /auth/me (and similar) is the *normal* state for anonymous
    // visitors — never log it. Other failures still surface in dev.
    const status = err instanceof ApiError ? err.status : 0;
    if (status !== 401 && process.env.NODE_ENV !== "production") {
      console.warn(`[apiServer] ${path} failed:`, (err as Error).message);
    }
    return fallback;
  }
}

export async function apiServerWithMeta<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const { json, headers, ...rest } = init;
  const jar = await cookies();
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : (rest as RequestInit).body,
  });

  const body = (await res.json()) as ApiOk<T> | ApiFail;
  if (!res.ok || body.success === false) {
    throw new ApiError(res.status, "error" in body ? body.error.message : res.statusText);
  }
  return { data: body.data, meta: body.meta };
}
