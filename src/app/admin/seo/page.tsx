import Topbar from "@/components/admin/Topbar";
import { apiServerSafe } from "@/lib/apiServer";

export const dynamic = "force-dynamic";

type Overview = {
  profile: {
    domain: string;
    domainStage: "new" | "growing" | "established";
    content: {
      totalPosts: number;
      published: number;
      drafts: number;
      categories: number;
      clusters: number;
      avgSeoScore: number;
      topicalCoverage: { name: string; count: number }[];
    };
    search: {
      connected: boolean;
      source: string;
      clicks: number | null;
      impressions: number | null;
      ctr: number | null;
      avgPosition: number | null;
      period?: { startDate: string; endDate: string };
    };
  };
  health: {
    avgScore: number;
    scoring80Plus: number;
    scoringBelow60: number;
    errorCount: number;
    warningCount: number;
  };
  providers: {
    searchConsole: boolean;
    keyword: boolean;
    serp: boolean;
    trends: boolean;
    backlink: boolean;
  };
  aiConfigured: boolean;
};

export default async function SeoOverviewPage() {
  const data = await apiServerSafe<Overview | null>("/seo/overview", null);

  if (!data) {
    return (
      <>
        <Topbar
          title="SEO Agent"
          subtitle="Nexversal SEO intelligence — real data only."
        />
        <div className="p-6">
          <div className="card p-6">
            <p className="text-sm text-foreground-muted">Could not load SEO overview.</p>
          </div>
        </div>
      </>
    );
  }

  const { profile, health, providers, aiConfigured } = data;
  const { content, search } = profile;
  const maxCoverage = Math.max(1, ...content.topicalCoverage.map((c) => c.count));

  const healthLabel =
    health.avgScore >= 75 ? "Good" : health.avgScore >= 60 ? "Needs work" : "Poor";
  const healthColor =
    health.avgScore >= 75
      ? "text-emerald-300"
      : health.avgScore >= 60
      ? "text-amber-300"
      : "text-rose-300";

  return (
    <>
      <Topbar
        title="SEO Agent"
        subtitle="Nexversal SEO intelligence — real data only."
      />

      <div className="p-6 space-y-6">
        {/* Health hero */}
        <div className="card p-6 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-bold tabular-nums ${healthColor}`}>
              {health.avgScore}
            </span>
            <span className="text-foreground-subtle text-lg">/ 100</span>
          </div>
          <div>
            <p className="font-semibold">
              SEO health: <span className={healthColor}>{healthLabel}</span>
            </p>
            <p className="text-xs text-foreground-subtle mt-1">
              {profile.domain} · {profile.domainStage} domain · avg content-quality score
              across your library.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
          <Stat label="Published" value={content.published} />
          <Stat label="Drafts" value={content.drafts} />
          <Stat label="Categories" value={content.categories} />
          <Stat label="Clusters" value={content.clusters} />
          <Stat label="Avg SEO score" value={content.avgSeoScore} accent={healthColor} />
          <Stat label="Scoring 80+" value={health.scoring80Plus} accent="text-emerald-300" />
          <Stat label="Below 60" value={health.scoringBelow60} accent="text-rose-300" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Search Console */}
          <div className="card p-6 h-fit">
            <h2 className="font-semibold">Search Console</h2>
            <p className="text-xs text-foreground-subtle">{search.source}</p>
            {search.connected ? (
              <>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <SearchMetric label="Clicks" value={fmtNum(search.clicks)} />
                  <SearchMetric label="Impressions" value={fmtNum(search.impressions)} />
                  <SearchMetric
                    label="CTR"
                    value={search.ctr != null ? `${(search.ctr * 100).toFixed(1)}%` : "—"}
                  />
                  <SearchMetric
                    label="Avg position"
                    value={search.avgPosition != null ? search.avgPosition.toFixed(1) : "—"}
                  />
                </div>
                {search.period && (
                  <p className="mt-4 text-xs text-foreground-subtle">
                    {search.period.startDate} → {search.period.endDate}
                  </p>
                )}
              </>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-foreground-muted">Data unavailable</p>
                <p className="text-xs text-foreground-subtle mt-1">
                  Connect Google Search Console in Settings.
                </p>
              </div>
            )}
          </div>

          {/* Topical coverage */}
          <div className="card p-6 lg:col-span-2">
            <h2 className="font-semibold">Topical coverage</h2>
            <p className="text-xs text-foreground-subtle">Where your content is concentrated</p>
            {content.topicalCoverage.length === 0 ? (
              <p className="mt-4 text-sm text-foreground-subtle">No topics yet.</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {content.topicalCoverage.map((c) => (
                  <li key={c.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground-muted">{c.name}</span>
                      <span className="text-foreground-subtle tabular-nums">{c.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-accent"
                        style={{ width: `${(c.count / maxCoverage) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Data sources */}
        <div className="card p-6">
          <h2 className="font-semibold">Data sources</h2>
          <p className="text-xs text-foreground-subtle">Connected providers powering this dashboard</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ProviderPill label="Search Console" on={providers.searchConsole} />
            <ProviderPill label="Keyword API" on={providers.keyword} />
            <ProviderPill label="SERP API" on={providers.serp} />
            <ProviderPill label="Trends" on={providers.trends} />
            <ProviderPill label="Backlinks" on={providers.backlink} />
            <ProviderPill
              label={aiConfigured ? "AI configured" : "Heuristics only"}
              on={aiConfigured}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function fmtNum(v: number | null) {
  return v != null ? v.toLocaleString("en-US") : "—";
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card p-4">
      <p className={`text-2xl font-bold tabular-nums ${accent ?? ""}`}>{value}</p>
      <p className="text-xs text-foreground-subtle mt-1">{label}</p>
    </div>
  );
}

function SearchMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-foreground-subtle mt-0.5">{label}</p>
    </div>
  );
}

function ProviderPill({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={`chip ${
        on ? "text-emerald-300 border-emerald-500/30" : "text-foreground-subtle"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${on ? "bg-emerald-400" : "bg-white/20"}`}
      />
      {label}
    </span>
  );
}
