export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type ApiOk<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiFail = { success: false; error: { message: string; details?: unknown } };
type ApiBody<T> = ApiOk<T> | ApiFail;

export async function api<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = init;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : (rest as RequestInit).body,
  });

  let body: ApiBody<T> | null = null;
  try {
    body = (await res.json()) as ApiBody<T>;
  } catch {
    /* non-json error */
  }

  if (!res.ok || !body || body.success === false) {
    const message = body && "error" in body ? body.error.message : res.statusText;
    const details = body && "error" in body ? body.error.details : undefined;
    throw new ApiError(res.status, message || "Request failed", details);
  }

  return body.data;
}
