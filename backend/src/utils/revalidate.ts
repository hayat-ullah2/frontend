import { env } from "../config/env.js";

/**
 * Best-effort fire-and-forget POST to the Next.js /api/revalidate webhook.
 * Never throws — if the frontend is down or the secret is wrong, we just log
 * a warning. The backend transaction that triggered it should always succeed.
 */
export async function revalidatePaths(paths: string[]) {
  if (!env.revalidateSecret) return;
  if (paths.length === 0) return;

  try {
    const res = await fetch(`${env.frontendUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": env.revalidateSecret,
      },
      body: JSON.stringify({ paths }),
      // Don't wait forever if the frontend is unreachable.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn(`[revalidate] ${res.status} for paths=${paths.join(",")}`);
    }
  } catch (err) {
    console.warn(`[revalidate] failed:`, (err as Error).message);
  }
}
