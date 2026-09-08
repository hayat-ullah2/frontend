import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import { apiServerSafe } from "@/lib/apiServer";

export const dynamic = "force-dynamic";

type Article = {
  id: string;
  title: string;
  slug: string;
  primaryKeyword: string;
  seoScore: number;
};

type Pair = {
  a: Article;
  b: Article;
  risk: "high" | "medium" | "low";
  similarity: number;
  reasons: string[];
  recommendations: string[];
};

function riskChip(risk: Pair["risk"]) {
  if (risk === "high") return "text-rose-300 border-rose-500/30";
  if (risk === "medium") return "text-amber-300 border-amber-500/30";
  return "text-foreground-subtle";
}

export default async function SeoCannibalizationPage() {
  const pairs = await apiServerSafe<Pair[]>("/seo/cannibalization", []);

  return (
    <>
      <Topbar
        title="Keyword cannibalization"
        subtitle="Articles that may be competing for the same queries."
      />

      <div className="p-6 space-y-6">
        <p className="text-xs text-foreground-subtle">
          Detected from your own content — no merging is ever done automatically.
        </p>

        {pairs.length === 0 ? (
          <div className="card p-6">
            <p className="text-sm text-foreground-muted">
              No cannibalization detected — your articles target distinct queries.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pairs.map((p, i) => (
              <div key={`${p.a.slug}-${p.b.slug}-${i}`} className="card p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className={`chip ${riskChip(p.risk)}`}>{p.risk} risk</span>
                  <span className="text-sm text-foreground-muted tabular-nums">
                    {Math.round(p.similarity * 100)}% similar
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <ArticleCard article={p.a} />
                  <ArticleCard article={p.b} />
                </div>

                {p.reasons.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
                      Why
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground-muted">
                      {p.reasons.map((r, ri) => (
                        <li key={ri}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {p.recommendations.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
                      Recommendations
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground-muted">
                      {p.recommendations.map((r, ri) => (
                        <li key={ri}>{r}</li>
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

function scoreColor(score: number) {
  return score >= 80 ? "text-emerald-300" : score >= 60 ? "text-amber-300" : "text-rose-300";
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <Link
        href={`/admin/blogs/${article.slug}/edit`}
        className="font-medium hover:text-foreground"
      >
        {article.title}
      </Link>
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-foreground-subtle">
          {article.primaryKeyword || "No primary keyword"}
        </span>
        <span className={`font-semibold tabular-nums ${scoreColor(article.seoScore)}`}>
          {article.seoScore} / 100
        </span>
      </div>
    </div>
  );
}
