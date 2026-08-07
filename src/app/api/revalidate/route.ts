import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand revalidation webhook. Called by the backend after a post is
 * created / updated / deleted (or category / user profile changes).
 *
 * Auth: shared secret via `x-revalidate-secret` header or `?secret=` query.
 * Set REVALIDATE_SECRET on both the Next.js frontend and the Node backend
 * (backend uses it to sign this request).
 *
 * Body:
 *   { "paths": ["/blog/some-slug", "/category/programming", "/blog", "/"] }
 * or:
 *   { "tag": "posts" }
 */
export const runtime = "nodejs";

const SECRET = process.env.REVALIDATE_SECRET ?? "";

export async function POST(req: Request) {
  const provided =
    req.headers.get("x-revalidate-secret") ??
    new URL(req.url).searchParams.get("secret");

  if (!SECRET || provided !== SECRET) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized" } },
      { status: 401 },
    );
  }

  let body: { paths?: string[] } = {};
  try {
    body = (await req.json()) as { paths?: string[] };
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid JSON body" } },
      { status: 400 },
    );
  }

  const revalidated: string[] = [];

  for (const p of body.paths ?? []) {
    if (typeof p === "string" && p.startsWith("/")) {
      revalidatePath(p);
      revalidated.push(p);
    }
  }

  // Always refresh the sitemap and RSS feed on any change.
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  revalidated.push("/sitemap.xml", "/feed.xml");

  return NextResponse.json({
    success: true,
    revalidated,
    now: new Date().toISOString(),
  });
}

// GET returns a small ping so you can verify the route is deployed.
export async function GET() {
  return NextResponse.json({ success: true, service: "revalidate" });
}
