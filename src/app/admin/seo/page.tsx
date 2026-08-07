import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import { apiServerSafe } from "@/lib/apiServer";
import type { ApiPost } from "@/lib/models";
import { analyzeSeo, ratingFor, type SeoAnalysis } from "@/lib/seo/engine";
import { COUNTRY_BY_CODE } from "@/lib/seo/geo";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const SITE_HOST = (() => {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return undefined;
  }
})();

function toEngineInput(p: ApiPost) {
  return {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    metaTitle: p.seo?.title,
    metaDescription: p.seo?.description,
    canonical: p.seo?.canonical,
    ogImage: p.seo?.ogImage,
    cover: p.cover,
    primaryKeyword: p.primaryKeyword,
    secondaryKeywords: p.secondaryKeywords,
    targetCountry: p.targetCountries?.[0],
    targetLanguage: p.targetLanguage,
    siteHost: SITE_HOST,
  };
}

export default async function AdminSeoPage() {
  // Pull every status so drafts count toward the dashboard.
  const [published, drafts, scheduled] = await Promise.all([
    apiServerSafe<ApiPost[]>("/posts?status=published&limit=1000", []),
    apiServerSafe<ApiPost[]>("/posts?status=draft&limit=1000", []),
    apiServerSafe<ApiPost[]>("/posts?status=scheduled&limit=1000", []),
  ]);
  const posts = [...published, ...drafts, ...scheduled];

  // Live analysis per post — accurate even for posts saved before this feature.
  const analyzed = posts.map((p) => ({ post: p, seo: analyzeSeo(toEngineInput(p)) }));

  const total = posts.length;
  const scores = analyzed.map((a) => a.seo.score);
  const avg = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : 0;
  const above80 = scores.filter((s) => s >= 80).length;
  const below60 = scores.filter((s) => s < 60).length;

  const missingMeta = posts.filter((p) => !(p.seo?.description || p.excerpt)).length;
  const missingCover = posts.filter((p) => !p.cover).length;
  const missingKeyword = posts.filter((p) => !p.primaryKeyword).length;
  const missingAlt = analyzed.filter((a) => a.seo.metrics.imagesMissingAlt > 0).length;

  // Country distribution.
  const countryCounts = new Map<string, number>();
  for (const p of posts) {
    const list = p.targetCountries?.length ? p.targetCountries : ["global"];
    for (const c of list) countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
  }
  const countryDist = [...countryCounts.entries()]
    .map(([code, count]) => ({
      code,
      name: COUNTRY_BY_CODE[code]?.name ?? code,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const topPerforming = [...analyzed].sort((a, b) => b.seo.score - a.seo.score).slice(0, 5);
  const needsWork = [...analyzed]
    .filter((a) => a.seo.score < 60)
    .sort((a, b) => a.seo.score - b.seo.score)
    .slice(0, 5);

  const health = [
    { label: "Posts missing a meta description", count: missingMeta },
    { label: "Posts missing a featured image", count: missingCover },
    { label: "Posts missing a primary keyword", count: missingKeyword },
    { label: "Posts with images missing alt text", count: missingAlt },
  ];

  return (
    <>
      <Topbar
        title="SEO dashboard"
        subtitle="Content-quality scores, keyword coverage, and geo distribution across your library."
      />

      <div className="p-6 space-y-6">
        {/* Score cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Stat label="Total posts" value={total} />
          <Stat label="Published" value={published.length} />
          <Stat label="Drafts" value={drafts.length} />
          <Stat label="Avg SEO score" value={avg} accent={ratingColor(avg)} />
          <Stat label="Scoring 80+" value={above80} accent="text-emerald-300" />
          <Stat label="Below 60" value={below60} accent="text-rose-300" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Health */}
          <div className="card p-6 h-fit">
            <h2 className="font-semibold">Content health</h2>
            <p className="text-xs text-foreground-subtle">Fixable issues across all posts</p>
            <ul className="mt-4 space-y-3">
              {health.map((h) => (
                <li key={h.label} className="flex items-center gap-3 text-sm">
                  <span
                    className={`w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs font-semibold ${
                      h.count === 0
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {h.count === 0 ? "✓" : h.count}
                  </span>
                  <span className="text-foreground-muted">{h.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Country distribution */}
          <div className="card p-6 lg:col-span-2">
            <h2 className="font-semibold">Country targeting</h2>
            <p className="text-xs text-foreground-subtle">How your library is geo-targeted</p>
            {countryDist.length === 0 ? (
              <p className="mt-4 text-sm text-foreground-subtle">No posts yet.</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {countryDist.map((c) => (
                  <li key={c.code}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground-muted">{c.name}</span>
                      <span className="text-foreground-subtle">{c.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-accent"
                        style={{ width: `${total ? (c.count / total) * 100 : 0}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Tables */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ScoreTable title="Top SEO performers" rows={topPerforming} empty="No posts yet." />
          <ScoreTable
            title="Needs improvement (score < 60)"
            rows={needsWork}
            empty="Nothing below 60 — nice work."
          />
        </div>
      </div>
    </>
  );
}

function ratingColor(score: number) {
  const r = ratingFor(score);
  return r === "excellent" || r === "good"
    ? "text-emerald-300"
    : r === "needs-improvement"
    ? "text-amber-300"
    : "text-rose-300";
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="card p-4">
      <p className={`text-2xl font-bold tabular-nums ${accent ?? ""}`}>{value}</p>
      <p className="text-xs text-foreground-subtle mt-1">{label}</p>
    </div>
  );
}

function ScoreTable({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { post: ApiPost; seo: SeoAnalysis }[];
  empty: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <h2 className="font-semibold">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="p-5 text-sm text-foreground-subtle">{empty}</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {rows.map(({ post, seo }) => (
              <tr key={post._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="p-4">
                  <Link href={`/admin/blogs/${post.slug}/edit`} className="hover:text-foreground">
                    {post.title}
                  </Link>
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-foreground-subtle">
                    {post.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className={`font-semibold tabular-nums ${ratingColor(seo.score)}`}>
                    {seo.score}
                  </span>
                  <span className="text-foreground-subtle text-xs"> / 100</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
