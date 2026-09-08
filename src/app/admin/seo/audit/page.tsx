import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import { apiServerSafe } from "@/lib/apiServer";

export const dynamic = "force-dynamic";

type IssueGroup = {
  id: string;
  category: string;
  severity: "error" | "warning";
  message: string;
  count: number;
  examples: { title: string; slug: string }[];
};

type WorstPost = {
  title: string;
  slug: string;
  score: number;
  status?: string;
  topIssue?: string;
};

type Audit = {
  totalPosts: number;
  avgScore: number;
  scoring80Plus: number;
  scoringBelow60: number;
  errorCount: number;
  warningCount: number;
  issueGroups: IssueGroup[];
  worstPosts: WorstPost[];
};

function scoreColor(score: number) {
  return score >= 80 ? "text-emerald-300" : score >= 60 ? "text-amber-300" : "text-rose-300";
}

export default async function SeoAuditPage() {
  const data = await apiServerSafe<Audit | null>("/seo/audit", null);

  if (!data) {
    return (
      <>
        <Topbar title="Site audit" subtitle="Content-quality issues across your library." />
        <div className="p-6">
          <div className="card p-6">
            <p className="text-sm text-foreground-muted">Could not load site audit.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Site audit" subtitle="Content-quality issues across your library." />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Avg SEO score" value={data.avgScore} accent={scoreColor(data.avgScore)} />
          <Stat label="Errors" value={data.errorCount} accent="text-rose-300" />
          <Stat label="Warnings" value={data.warningCount} accent="text-amber-300" />
          <Stat label="Below 60" value={data.scoringBelow60} accent="text-rose-300" />
        </div>

        {/* Issue groups */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-semibold">Issues</h2>
          </div>
          {data.issueGroups.length === 0 ? (
            <p className="p-5 text-sm text-foreground-subtle">No issues detected — nice work.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {data.issueGroups.map((g) => (
                  <tr
                    key={g.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="p-4 w-8 align-top">
                      <span
                        className={
                          g.severity === "error" ? "text-rose-300" : "text-amber-300"
                        }
                      >
                        {g.severity === "error" ? "✕" : "⚠"}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-foreground">{g.message}</p>
                      <p className="text-xs text-foreground-subtle mt-0.5 uppercase tracking-wider">
                        {g.category}
                      </p>
                    </td>
                    <td className="p-4 text-right align-top">
                      <span className="font-semibold tabular-nums">{g.count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Worst posts */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-semibold">Worst-scoring posts</h2>
          </div>
          {data.worstPosts.length === 0 ? (
            <p className="p-5 text-sm text-foreground-subtle">No low-scoring posts.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {data.worstPosts.map((p) => (
                  <tr
                    key={p.slug}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="p-4">
                      <Link
                        href={`/admin/blogs/${p.slug}/edit`}
                        className="hover:text-foreground"
                      >
                        {p.title}
                      </Link>
                      {p.status && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-foreground-subtle">
                          {p.status}
                        </span>
                      )}
                      {p.topIssue && (
                        <p className="text-xs text-foreground-subtle mt-0.5">{p.topIssue}</p>
                      )}
                    </td>
                    <td className="p-4 text-right align-top">
                      <span className={`font-semibold tabular-nums ${scoreColor(p.score)}`}>
                        {p.score}
                      </span>
                      <span className="text-foreground-subtle text-xs"> / 100</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card p-4">
      <p className={`text-2xl font-bold tabular-nums ${accent ?? ""}`}>{value}</p>
      <p className="text-xs text-foreground-subtle mt-1">{label}</p>
    </div>
  );
}
