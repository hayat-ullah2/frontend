"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  analyzeArticleAgent,
  applyAgentChanges,
  getArticleHistory,
  revertAgentRun,
  type ArticleAnalysis,
  type ChangeProposal,
  type SeoChangeRecord,
} from "@/lib/seoAgent";

const CONFIDENCE_CLS: Record<string, string> = {
  high: "text-emerald-300 bg-emerald-500/15",
  medium: "text-amber-300 bg-amber-500/15",
  low: "text-foreground-subtle bg-white/10",
};

const RISK_CLS: Record<string, string> = {
  high: "text-rose-300 bg-rose-500/15",
  medium: "text-amber-300 bg-amber-500/15",
  low: "text-foreground-subtle bg-white/10",
};

/**
 * In-editor SEO Agent. Only rendered for SAVED posts (it operates by slug and
 * writes an audit-trailed change history). Shows the Nexversal Opportunity
 * Score, cannibalization warnings, real internal-link suggestions and
 * safe metadata change proposals with before/after + Accept / Apply / Revert.
 */
export default function AgentOptimizer({
  slug,
  onInsertLink,
  onApplied,
}: {
  slug: string;
  onInsertLink: (targetSlug: string, anchor: string) => void;
  onApplied?: () => void;
}) {
  const [data, setData] = useState<ArticleAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<SeoChangeRecord[] | null>(null);

  async function run() {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const res = await analyzeArticleAgent(slug);
      setData(res);
      // Pre-select all auto-safe proposals.
      setAccepted(new Set(res.proposals.filter((p) => p.autoSafe).map((p) => p.field)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  function toggle(field: string) {
    setAccepted((s) => {
      const next = new Set(s);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }

  async function apply(which: ChangeProposal[]) {
    if (which.length === 0) return;
    setApplying(true);
    setError(null);
    setNotice(null);
    try {
      const res = await applyAgentChanges(slug, which, "suggest");
      setNotice(`Applied ${res.applied} change${res.applied === 1 ? "" : "s"}. Reload the editor to see updated fields.`);
      onApplied?.();
      await run(); // refresh proposals
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not apply changes.");
    } finally {
      setApplying(false);
    }
  }

  async function loadHistory() {
    try {
      setHistory(await getArticleHistory(slug));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load history.");
    }
  }

  async function revert(runId: string) {
    setApplying(true);
    try {
      const res = await revertAgentRun(slug, runId);
      setNotice(`Reverted ${res.reverted} change${res.reverted === 1 ? "" : "s"}.`);
      await loadHistory();
      onApplied?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not revert.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-5 border-b border-white/5 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            SEO Agent
            <span className="text-[10px] uppercase tracking-wider text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded-full">
              Beta
            </span>
          </h3>
          <p className="text-xs text-foreground-subtle">
            Opportunity, cannibalization, internal links & safe fixes · real data only
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="btn-primary text-sm disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? "Analyzing…" : data ? "Re-run agent" : "Run SEO Agent"}
        </button>
      </div>

      <div className="p-5 space-y-5">
        {error && <p className="text-xs text-rose-300">{error}</p>}
        {notice && <p className="text-xs text-emerald-300">{notice}</p>}

        {!data ? (
          <p className="text-sm text-foreground-subtle">
            Run the agent to analyze this saved article against your whole library.
          </p>
        ) : (
          <>
            {/* Opportunity score — clearly labelled non-Google metric. */}
            <div className="rounded-lg border border-white/10 bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-foreground-subtle">
                    Nexversal Opportunity Score
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {data.opportunity.score}
                    <span className="text-sm text-foreground-subtle"> / 100</span>
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-foreground-subtle bg-white/10 px-2 py-0.5 rounded-full">
                  {data.opportunity.label}
                </span>
              </div>
              {data.opportunity.basis.length > 0 && (
                <p className="mt-2 text-[11px] text-foreground-subtle">
                  Based on: {data.opportunity.basis.join(" · ")}
                </p>
              )}
              {data.opportunity.missing.length > 0 && (
                <p className="mt-1 text-[11px] text-foreground-subtle">
                  Data unavailable: {data.opportunity.missing.join(", ")} (connect a provider in Settings)
                </p>
              )}
            </div>

            {/* Cannibalization */}
            {data.cannibalization.length > 0 && (
              <Section title={`Cannibalization (${data.cannibalization.length})`}>
                <ul className="space-y-2">
                  {data.cannibalization.map((c) => (
                    <li key={c.b.id} className="rounded-lg border border-white/10 bg-background p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-foreground-muted truncate">↔ {c.b.title}</span>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${RISK_CLS[c.risk]}`}>
                          {c.risk} · {(c.similarity * 100).toFixed(0)}%
                        </span>
                      </div>
                      <ul className="mt-1.5 ml-4 list-disc text-[11px] text-foreground-subtle space-y-0.5">
                        {c.reasons.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-foreground-subtle">
                  Detected from your content — nothing is ever merged automatically.
                </p>
              </Section>
            )}

            {/* Internal links */}
            {data.internalLinks.length > 0 && (
              <Section title={`Internal link suggestions (${data.internalLinks.length})`}>
                <ul className="space-y-1.5">
                  {data.internalLinks.map((s) => (
                    <li key={s.targetId} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0">
                        <span className="text-foreground-muted truncate block">→ {s.targetTitle}</span>
                        <span className="text-[11px] text-foreground-subtle">{s.reason} · {s.relevance}%</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onInsertLink(s.targetSlug, s.anchor)}
                        className="btn-ghost text-xs whitespace-nowrap"
                      >
                        Insert
                      </button>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Safe change proposals */}
            <Section title={`Safe fixes (${data.proposals.length})`} defaultOpen>
              {data.proposals.length === 0 ? (
                <p className="text-sm text-emerald-300">No metadata fixes needed — nice.</p>
              ) : (
                <>
                  <ul className="space-y-2">
                    {data.proposals.map((p) => (
                      <li key={p.field} className="rounded-lg border border-white/10 bg-background p-3">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={accepted.has(p.field)}
                            onChange={() => toggle(p.field)}
                            className="mt-1"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{p.field}</span>
                              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${CONFIDENCE_CLS[p.confidence]}`}>
                                {p.confidence}
                              </span>
                              {!p.autoSafe && (
                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-foreground-subtle">
                                  review
                                </span>
                              )}
                            </span>
                            <span className="mt-1 block text-[11px] text-foreground-subtle">{p.reason}</span>
                            <span className="mt-1.5 block text-xs">
                              <span className="text-rose-300/80 line-through break-words">{p.before || "(empty)"}</span>
                              <span className="text-emerald-300 break-words block mt-0.5">{p.after}</span>
                            </span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={applying || accepted.size === 0}
                      onClick={() => apply(data.proposals.filter((p) => accepted.has(p.field)))}
                      className="btn-primary text-sm disabled:opacity-60"
                    >
                      {applying ? "Applying…" : `Apply selected (${accepted.size})`}
                    </button>
                    <button
                      type="button"
                      disabled={applying}
                      onClick={() => apply(data.proposals.filter((p) => p.autoSafe))}
                      className="btn-ghost text-sm disabled:opacity-60"
                    >
                      Apply all safe
                    </button>
                  </div>
                </>
              )}
            </Section>

            {/* History / revert */}
            <Section title="Change history">
              <button type="button" onClick={loadHistory} className="btn-ghost text-xs">
                {history ? "Refresh history" : "Load history"}
              </button>
              {history && history.length === 0 && (
                <p className="mt-2 text-xs text-foreground-subtle">No agent changes yet.</p>
              )}
              {history && history.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {history.map((h) => (
                    <li key={h._id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-foreground-subtle truncate">
                        {h.reverted ? "↩ " : ""}{h.field}: “{h.before || "(empty)"}” → “{h.after}”
                      </span>
                      {!h.reverted && (
                        <button
                          type="button"
                          onClick={() => revert(h.runId)}
                          disabled={applying}
                          className="text-rose-300 hover:text-rose-200 whitespace-nowrap disabled:opacity-60"
                        >
                          Revert
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-t border-white/5 pt-4">
      <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-medium select-none">
        <span>{title}</span>
        <span className="text-foreground-subtle transition group-open:rotate-180">▾</span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}
