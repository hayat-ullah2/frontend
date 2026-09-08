import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import { apiServerSafe } from "@/lib/apiServer";

export const dynamic = "force-dynamic";

type Cluster = {
  key: string;
  name: string;
  pillar: { id: string; title: string; slug: string } | null;
  supporting: { id: string; title: string; slug: string; seoScore: number }[];
  size: number;
  avgScore: number | null;
  hasPillar: boolean;
};

function scoreColor(score: number) {
  return score >= 80 ? "text-emerald-300" : score >= 60 ? "text-amber-300" : "text-rose-300";
}

export default async function SeoClustersPage() {
  const clusters = await apiServerSafe<Cluster[]>("/seo/clusters", []);

  return (
    <>
      <Topbar
        title="Topic clusters"
        subtitle="Pillar and supporting articles grouped by topic."
      />

      <div className="p-6 space-y-6">
        {clusters.length === 0 ? (
          <div className="card p-6">
            <p className="text-sm text-foreground-muted">
              No clusters yet — group related articles around a pillar topic.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {clusters.map((c) => (
              <div key={c.key} className="card p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-semibold">{c.name}</h2>
                  <div className="flex items-center gap-4 text-xs text-foreground-subtle tabular-nums">
                    <span>{c.size} articles</span>
                    <span>Avg {c.avgScore != null ? c.avgScore : "—"}</span>
                  </div>
                </div>

                {/* Pillar */}
                {c.pillar ? (
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="chip-accent text-[10px] uppercase tracking-wider">
                        Pillar
                      </span>
                      {!c.hasPillar && (
                        <span className="text-xs text-foreground-subtle">
                          No explicit pillar set — highest-scoring article shown
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/admin/blogs/${c.pillar.slug}/edit`}
                      className="font-medium hover:text-foreground"
                    >
                      {c.pillar.title}
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs text-foreground-subtle">No pillar article.</p>
                )}

                {/* Supporting */}
                {c.supporting.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-foreground-subtle mb-2">
                      Supporting articles
                    </p>
                    <ul className="space-y-1.5">
                      {c.supporting.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <Link
                            href={`/admin/blogs/${s.slug}/edit`}
                            className="text-foreground-muted hover:text-foreground truncate"
                          >
                            {s.title}
                          </Link>
                          <span
                            className={`font-semibold tabular-nums shrink-0 ${scoreColor(
                              s.seoScore,
                            )}`}
                          >
                            {s.seoScore}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
