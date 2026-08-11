import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api";

// Outbound clicks must never be cached or prerendered — each hit is a real
// user leaving the site and must be logged.
export const dynamic = "force-dynamic";

/**
 * Tracked affiliate/outbound redirect. `/go/notion?from=best-ai-tools&sid=…`
 * → logs the click server-side (via the API), then 302s to the real
 * destination. Keeping the destination server-side means affiliate tags can be
 * rotated in one place without touching any published article.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const from = req.nextUrl.searchParams.get("from") ?? "";
  const sid = req.nextUrl.searchParams.get("sid") ?? "";

  try {
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (sid) qs.set("sid", sid);
    const res = await fetch(
      `${API_BASE_URL}/affiliate-links/${encodeURIComponent(slug)}/click?${qs}`,
      { method: "POST", cache: "no-store" },
    );
    const body = (await res.json().catch(() => null)) as
      | { data?: { url?: string } }
      | null;
    const url = body?.data?.url;
    if (res.ok && url && /^https?:\/\//i.test(url)) {
      return NextResponse.redirect(url, 302);
    }
  } catch {
    /* fall through to a safe destination */
  }

  // Unknown/inactive link — send the visitor home instead of a dead end.
  return NextResponse.redirect(new URL("/", req.url), 302);
}
