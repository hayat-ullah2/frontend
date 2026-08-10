import { apiPublicSafe } from "@/lib/apiServer";
import type { ApiPost } from "@/lib/models";
import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// Cache the feed for 5 minutes to match the rest of the ISR strategy.
export const revalidate = 300;
export const dynamic = "force-static";

// XML-escape helper — RSS is strict about <>&"'
function esc(s: string | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await apiPublicSafe<ApiPost[]>(
    "/posts?limit=20&status=published",
    [],
  );

  const items = posts
    .map((p) => {
      const url = absoluteUrl(`/blog/${p.slug}`);
      const pubDate = new Date(p.publishedAt ?? p.createdAt).toUTCString();
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${esc(SITE_AUTHOR)} (${esc(p.author?.name ?? SITE_AUTHOR)})</author>
      ${p.category ? `<category>${esc(p.category.name)}</category>` : ""}
    </item>`;
    })
    .join("\n");

  const lastBuild =
    posts.length > 0
      ? new Date(posts[0].publishedAt ?? posts[0].createdAt).toUTCString()
      : new Date().toUTCString();

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
