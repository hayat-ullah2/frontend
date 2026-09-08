import Topbar from "@/components/admin/Topbar";
import { apiServerSafe } from "@/lib/apiServer";

export const dynamic = "force-dynamic";

type Settings = {
  providers: {
    searchConsole: boolean;
    keyword: boolean;
    serp: boolean;
    trends: boolean;
    backlink: boolean;
  };
  aiConfigured: boolean;
  strategy: {
    domainStage: string;
    targetCountry: string;
    targetLanguage: string;
  };
};

export default async function SeoSettingsPage() {
  const data = await apiServerSafe<Settings | null>("/seo/settings", null);

  if (!data) {
    return (
      <>
        <Topbar title="SEO Agent settings" subtitle="Provider and strategy configuration." />
        <div className="p-6">
          <div className="card p-6">
            <p className="text-sm text-foreground-muted">Could not load SEO settings.</p>
          </div>
        </div>
      </>
    );
  }

  const { providers, aiConfigured, strategy } = data;

  const providerRows = [
    {
      label: "Google Search Console",
      on: providers.searchConsole,
      hint: "Set GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_REFRESH_TOKEN, GSC_SITE_URL.",
    },
    { label: "Keyword API", on: providers.keyword, hint: "No provider wired in Phase 1." },
    { label: "SERP API", on: providers.serp, hint: "No provider wired in Phase 1." },
    { label: "Trends", on: providers.trends, hint: "No provider wired in Phase 1." },
    { label: "Backlinks", on: providers.backlink, hint: "No provider wired in Phase 1." },
  ];

  return (
    <>
      <Topbar title="SEO Agent settings" subtitle="Provider and strategy configuration." />

      <div className="p-6 space-y-6">
        <div className="card p-4">
          <p className="text-sm text-foreground-muted">
            These settings are read-only and configured via environment variables in Phase 1.
          </p>
        </div>

        {/* Data providers */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-semibold">Data providers</h2>
          </div>
          <ul>
            {providerRows.map((p) => (
              <li
                key={p.label}
                className="flex items-start justify-between gap-4 p-4 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="text-sm text-foreground">{p.label}</p>
                  {!p.on && (
                    <p className="text-xs text-foreground-subtle mt-0.5">{p.hint}</p>
                  )}
                </div>
                <Badge on={p.on} />
              </li>
            ))}
          </ul>
        </div>

        {/* AI provider */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">AI provider</h2>
              {aiConfigured ? (
                <p className="text-xs text-emerald-300 mt-1">AI configured</p>
              ) : (
                <p className="text-xs text-foreground-subtle mt-1">
                  Heuristics only — set AI_PROVIDER and AI_API_KEY to enable AI features.
                </p>
              )}
            </div>
            <Badge on={aiConfigured} onLabel="Configured" offLabel="Heuristics only" />
          </div>
        </div>

        {/* Strategy */}
        <div className="card p-5">
          <h2 className="font-semibold">Strategy</h2>
          <p className="text-xs text-foreground-subtle mt-1">
            Configured via env: SEO_DOMAIN_STAGE, SEO_TARGET_COUNTRY, SEO_TARGET_LANGUAGE.
          </p>
          <dl className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
            <StrategyItem label="Domain stage" value={strategy.domainStage} />
            <StrategyItem label="Target country" value={strategy.targetCountry} />
            <StrategyItem label="Target language" value={strategy.targetLanguage} />
          </dl>
        </div>
      </div>
    </>
  );
}

function Badge({
  on,
  onLabel = "Connected",
  offLabel = "Not connected",
}: {
  on: boolean;
  onLabel?: string;
  offLabel?: string;
}) {
  return (
    <span
      className={`chip shrink-0 ${on ? "text-emerald-300 border-emerald-500/30" : "text-foreground-subtle"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${on ? "bg-emerald-400" : "bg-white/20"}`} />
      {on ? onLabel : offLabel}
    </span>
  );
}

function StrategyItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-foreground-subtle">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
