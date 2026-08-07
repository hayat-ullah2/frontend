"use client";

import { useState } from "react";
import {
  CATEGORY_LABELS,
  type SeoAnalysis,
  type SeoCategoryKey,
  type Severity,
} from "@/lib/seo/engine";
import {
  generateBrief,
  getAiSuggestions,
  type AiSuggestion,
  type ContentBrief,
  type PostInput,
} from "@/lib/posts";
import { ApiError } from "@/lib/api";

const RATING_META: Record<
  SeoAnalysis["rating"],
  { label: string; emoji: string; ring: string; text: string }
> = {
  excellent: { label: "Excellent", emoji: "🟢", ring: "#34d399", text: "text-emerald-300" },
  good: { label: "Good SEO", emoji: "🟢", ring: "#a3e635", text: "text-lime-300" },
  "needs-improvement": { label: "Needs improvement", emoji: "🟡", ring: "#fbbf24", text: "text-amber-300" },
  poor: { label: "Poor", emoji: "🔴", ring: "#fb7185", text: "text-rose-300" },
};

const SEVERITY_META: Record<Severity, { icon: string; cls: string; label: string }> = {
  error: { icon: "✕", cls: "text-rose-300", label: "ERROR" },
  warning: { icon: "⚠", cls: "text-amber-300", label: "WARNING" },
  good: { icon: "✓", cls: "text-emerald-300", label: "GOOD" },
};

const CATEGORY_ORDER: SeoCategoryKey[] = [
  "keyword",
  "structure",
  "metadata",
  "readability",
  "links",
  "images",
];

export default function SeoPanel({
  analysis,
  analyzing,
  onAnalyze,
  serverVerified,
  getInput,
  internalLinkSuggestions,
  onInsertLink,
}: {
  analysis: SeoAnalysis | null;
  analyzing: boolean;
  onAnalyze: () => void;
  serverVerified: boolean;
  getInput: () => Partial<PostInput>;
  internalLinkSuggestions: { title: string; slug: string }[];
  onInsertLink: (slug: string, title: string) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="p-5 border-b border-white/5 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            SEO analysis
            {serverVerified && (
              <span className="text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                Server-verified
              </span>
            )}
          </h3>
          <p className="text-xs text-foreground-subtle">
            Live, on every edit · calculated from your actual content
          </p>
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={analyzing}
          className="btn-primary text-sm disabled:opacity-60 whitespace-nowrap"
        >
          {analyzing ? "Analyzing…" : "Analyze SEO"}
        </button>
      </div>

      {!analysis ? (
        <div className="p-6 text-sm text-foreground-subtle">
          Start writing — analysis appears here automatically.
        </div>
      ) : (
        <div className="p-5 space-y-5">
          <ScoreHeader analysis={analysis} />
          <CategoryBars analysis={analysis} />
          <SerpPreview analysis={analysis} />
          <KeywordSection analysis={analysis} />
          <ContentQuality analysis={analysis} />
          <IssuesSection analysis={analysis} />
          {analysis.localization.length > 0 && <LocalizationSection analysis={analysis} />}
          {internalLinkSuggestions.length > 0 && (
            <InternalLinks
              suggestions={internalLinkSuggestions}
              onInsertLink={onInsertLink}
            />
          )}
          <AiSection getInput={getInput} />
        </div>
      )}
    </div>
  );
}

// ── Score gauge ───────────────────────────────────────────────────────────

function ScoreHeader({ analysis }: { analysis: SeoAnalysis }) {
  const meta = RATING_META[analysis.rating];
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (analysis.score / 100) * c;
  return (
    <div className="flex items-center gap-5">
      <div className="relative w-24 h-24 shrink-0">
        <svg viewBox="0 0 80 80" className="w-24 h-24 -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={meta.ring}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 400ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center leading-none">
            <span className="text-2xl font-bold">{analysis.score}</span>
            <span className="block text-[10px] text-foreground-subtle mt-0.5">/ 100</span>
          </div>
        </div>
      </div>
      <div>
        <p className={`text-lg font-semibold ${meta.text}`}>
          {meta.emoji} {meta.label}
        </p>
        <p className="text-xs text-foreground-subtle mt-1 max-w-xs">
          A summary of on-page SEO fundamentals — not a ranking guarantee.
        </p>
        <div className="mt-2 flex gap-2 text-[11px] text-foreground-subtle">
          <span>{analysis.metrics.words} words</span>·
          <span>{analysis.metrics.readingTimeMin} min read</span>·
          <span>{analysis.metrics.headings.total} headings</span>
        </div>
      </div>
    </div>
  );
}

// ── Category bars ─────────────────────────────────────────────────────────

function CategoryBars({ analysis }: { analysis: SeoAnalysis }) {
  return (
    <div className="space-y-2.5">
      {CATEGORY_ORDER.map((key) => {
        const cat = analysis.categories[key];
        const color =
          cat.percent >= 80 ? "bg-emerald-400" : cat.percent >= 55 ? "bg-amber-400" : "bg-rose-400";
        return (
          <div key={key}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-foreground-muted">{CATEGORY_LABELS[key]}</span>
              <span className="text-foreground-subtle tabular-nums">{cat.percent}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${cat.percent}%`, transition: "width 400ms ease" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Google SERP preview ───────────────────────────────────────────────────

function SerpPreview({ analysis }: { analysis: SeoAnalysis }) {
  const { serp } = analysis;
  return (
    <Section title="Google search preview" defaultOpen>
      <div className="rounded-lg border border-white/10 bg-background p-4">
        <p className="text-xs text-emerald-300/80 truncate">{serp.url}</p>
        <p className="text-[#8ab4f8] text-lg leading-snug mt-0.5 truncate">{serp.title}</p>
        <p className="text-sm text-foreground-muted mt-1 line-clamp-2">{serp.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
        <CharMeter label="Title" len={serp.titleLength} limit={60} />
        <CharMeter label="Description" len={serp.descriptionLength} limit={160} />
      </div>
      <p className="mt-2 text-[11px] text-foreground-subtle">
        Approximate limits — Google may rewrite titles and descriptions.
      </p>
    </Section>
  );
}

function CharMeter({ label, len, limit }: { label: string; len: number; limit: number }) {
  const over = len > limit;
  return (
    <div>
      <div className="flex justify-between">
        <span className="text-foreground-subtle">{label}</span>
        <span className={over ? "text-amber-300" : "text-foreground-muted"}>
          {len} / {limit}
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
        <div
          className={`h-full rounded-full ${over ? "bg-amber-400" : "bg-emerald-400"}`}
          style={{ width: `${Math.min(100, (len / limit) * 100)}%` }}
        />
      </div>
    </div>
  );
}

// ── Keyword section ───────────────────────────────────────────────────────

const KW_STATUS: Record<string, { icon: string; cls: string; label: string }> = {
  good: { icon: "✓", cls: "text-emerald-300", label: "Used naturally" },
  underused: { icon: "⚠", cls: "text-amber-300", label: "Underused" },
  overused: { icon: "⚠", cls: "text-rose-300", label: "Overused" },
  missing: { icon: "✕", cls: "text-rose-300", label: "Missing" },
};

function KeywordSection({ analysis }: { analysis: SeoAnalysis }) {
  const { primary, secondary } = analysis;
  return (
    <Section title="Keywords" defaultOpen>
      {primary ? (
        <div className="rounded-lg border border-white/10 bg-background p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-foreground-subtle">Primary keyword</p>
              <p className="font-medium">“{primary.keyword}”</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-foreground-subtle">Density</p>
              <p className="font-medium tabular-nums">{primary.density}%</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Placement ok={primary.inTitle} label="Title" />
            <Placement ok={primary.inFirstParagraph} label="Intro" />
            <Placement ok={primary.inHeadings} label="Heading" />
            <Placement ok={primary.inSlug} label="Slug" />
            <Placement ok={primary.inMetaDescription} label="Meta" />
          </div>
          <p className="mt-2 text-[11px] text-foreground-subtle">
            Recommended: natural usage. Density is guidance, not a ranking rule.
          </p>
        </div>
      ) : (
        <p className="text-sm text-amber-200">No primary keyword set yet.</p>
      )}

      {secondary.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {secondary.map((k) => {
            const st = KW_STATUS[k.status];
            return (
              <li key={k.keyword} className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted truncate">{k.keyword}</span>
                <span className={`${st.cls} text-xs whitespace-nowrap`}>
                  {st.icon} {st.label}{k.count > 0 ? ` · ${k.density}%` : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

function Placement({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full border ${
        ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-white/10 bg-white/5 text-foreground-subtle"
      }`}
    >
      {ok ? "✓" : "○"} {label}
    </span>
  );
}

// ── Content quality ───────────────────────────────────────────────────────

function ContentQuality({ analysis }: { analysis: SeoAnalysis }) {
  const m = analysis.metrics;
  const stats: { label: string; value: string }[] = [
    { label: "Words", value: m.words.toLocaleString() },
    { label: "Reading time", value: `${m.readingTimeMin} min` },
    { label: "Reading ease", value: `${m.fleschReadingEase}` },
    { label: "Avg sentence", value: `${m.avgSentenceLength} words` },
    { label: "Headings", value: `${m.headings.total}` },
    { label: "Paragraphs", value: `${m.paragraphs}` },
    { label: "Internal links", value: `${m.internalLinks}` },
    { label: "External links", value: `${m.externalLinks}` },
    { label: "Images", value: `${m.images}` },
  ];
  return (
    <Section title="Content quality">
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-background border border-white/5 p-2.5">
            <p className="text-sm font-semibold tabular-nums">{s.value}</p>
            <p className="text-[10px] text-foreground-subtle">{s.label}</p>
          </div>
        ))}
      </div>
      {m.imagesMissingAlt > 0 && (
        <p className="mt-2 text-xs text-amber-300">{m.imagesMissingAlt} image(s) missing alt text.</p>
      )}
    </Section>
  );
}

// ── Issues ────────────────────────────────────────────────────────────────

function IssuesSection({ analysis }: { analysis: SeoAnalysis }) {
  const errors = analysis.issues.filter((i) => i.severity === "error");
  const warnings = analysis.issues.filter((i) => i.severity === "warning");
  const goods = analysis.issues.filter((i) => i.severity === "good");
  return (
    <Section
      title={`Issues to fix (${errors.length} errors · ${warnings.length} warnings)`}
      defaultOpen
    >
      <ul className="space-y-1.5">
        {[...errors, ...warnings, ...goods].map((i) => {
          const st = SEVERITY_META[i.severity];
          return (
            <li key={i.id} className="flex items-start gap-2 text-sm">
              <span className={`${st.cls} mt-0.5`}>{st.icon}</span>
              <span className={i.severity === "good" ? "text-foreground-subtle" : "text-foreground-muted"}>
                {i.message}
              </span>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function LocalizationSection({ analysis }: { analysis: SeoAnalysis }) {
  return (
    <Section title="Geo & localization">
      <ul className="space-y-1.5">
        {analysis.localization.map((l, idx) => {
          const st = SEVERITY_META[l.severity];
          return (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className={`${st.cls} mt-0.5`}>{st.icon}</span>
              <span className="text-foreground-muted">{l.message}</span>
            </li>
          );
        })}
      </ul>
      {analysis.intent && (
        <p className="mt-2 text-xs text-foreground-subtle">
          Suggested search intent:{" "}
          <span className="text-foreground-muted capitalize">{analysis.intent.suggested}</span> ·{" "}
          {analysis.intent.confidence}% confidence (estimate)
        </p>
      )}
    </Section>
  );
}

// ── Internal links ────────────────────────────────────────────────────────

function InternalLinks({
  suggestions,
  onInsertLink,
}: {
  suggestions: { title: string; slug: string }[];
  onInsertLink: (slug: string, title: string) => void;
}) {
  return (
    <Section title="Suggested internal links">
      <ul className="space-y-1.5">
        {suggestions.map((s) => (
          <li key={s.slug} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-foreground-muted truncate">→ {s.title}</span>
            <button
              type="button"
              onClick={() => onInsertLink(s.slug, s.title)}
              className="btn-ghost text-xs whitespace-nowrap"
            >
              Insert
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ── AI section ────────────────────────────────────────────────────────────

function AiSection({ getInput }: { getInput: () => Partial<PostInput> }) {
  const [suggestions, setSuggestions] = useState<AiSuggestion[] | null>(null);
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [loading, setLoading] = useState<null | "sug" | "brief">(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: "sug" | "brief") {
    setError(null);
    setLoading(kind);
    try {
      if (kind === "sug") setSuggestions(await getAiSuggestions(getInput()));
      else setBrief(await generateBrief(getInput()));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Section title="AI SEO assistant">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => run("sug")} disabled={loading !== null} className="btn-ghost text-sm disabled:opacity-60">
          {loading === "sug" ? "Thinking…" : "AI SEO suggestions"}
        </button>
        <button type="button" onClick={() => run("brief")} disabled={loading !== null} className="btn-ghost text-sm disabled:opacity-60">
          {loading === "brief" ? "Generating…" : "Generate content brief"}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-foreground-subtle">
        Works without an API key using local analysis; connect a provider for richer, semantic output.
      </p>

      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}

      {suggestions && (
        <ol className="mt-3 space-y-1.5 text-sm list-decimal ml-4">
          {suggestions.map((s, i) => (
            <li key={i} className="text-foreground-muted">
              <span className="text-[10px] uppercase tracking-wider text-foreground-subtle mr-1">{s.category}</span>
              {s.suggestion}
            </li>
          ))}
        </ol>
      )}

      {brief && <BriefView brief={brief} />}
    </Section>
  );
}

function BriefView({ brief }: { brief: ContentBrief }) {
  const blocks: { label: string; items: string[] }[] = [
    { label: "Suggested titles", items: brief.suggestedTitles },
    { label: "Suggested H2s", items: brief.suggestedH2s },
    { label: "Suggested H3s", items: brief.suggestedH3s },
    { label: "Questions to answer", items: brief.questionsToAnswer },
    { label: "Subtopics", items: brief.subtopics },
    { label: "Internal link ideas", items: brief.internalLinkOpportunities },
    { label: "Content gaps", items: brief.contentGaps },
  ];
  return (
    <div className="mt-3 rounded-lg border border-white/10 bg-background p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-medium">Content brief</p>
        <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">
          {brief.source === "ai" ? "AI-generated" : "Heuristic"} · {brief.searchIntent}
        </span>
      </div>
      {blocks
        .filter((b) => b.items.length > 0)
        .map((b) => (
          <div key={b.label}>
            <p className="text-[10px] uppercase tracking-wider text-foreground-subtle mb-1">{b.label}</p>
            <ul className="list-disc ml-4 space-y-0.5 text-foreground-muted">
              {b.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      {brief.suggestedCta && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-foreground-subtle mb-1">Suggested CTA</p>
          <p className="text-foreground-muted">{brief.suggestedCta}</p>
        </div>
      )}
    </div>
  );
}

// ── Collapsible section ───────────────────────────────────────────────────

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
