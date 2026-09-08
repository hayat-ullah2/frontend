// ────────────────────────────────────────────────────────────────────────────
// SEO data-provider abstraction.
//
// The #1 rule of the Nexversal SEO Agent: NEVER fabricate external data
// (search volume, rankings, difficulty, CPC, trends, SERP positions, backlinks).
// Every provider therefore returns a `ProviderResult` that is EITHER real data
// from a named source, OR an explicit `available: false` with a human-readable
// note. Business logic branches on `available`; the UI shows "Data unavailable"
// (or "Estimated" / "AI recommendation" for clearly-labelled non-authoritative
// signals) and always renders the `source`.
//
// Adapters mirror the existing AI-provider pattern (services/ai/index.ts):
// swappable implementations selected by config, keys read server-side only.
// A Null* implementation is the default so the whole system works with zero
// external integrations — it just reports honestly that the data isn't there.
// ────────────────────────────────────────────────────────────────────────────

/** The provenance of a metric. `unavailable` = we have no real data for it. */
export type DataSource =
  | "google-search-console"
  | "google-trends"
  | "serp-api"
  | "keyword-api"
  | "backlink-api"
  | "nexversal-internal" // computed from our own database — always real
  | "ai-recommendation" // an AI/heuristic estimate, never presented as measured
  | "unavailable";

/**
 * A uniform envelope for any externally-sourced metric. When `available` is
 * false, `data` is undefined and `note` explains why (e.g. "Search Console not
 * connected"). This is what keeps the agent honest end-to-end.
 */
export type ProviderResult<T> = {
  available: boolean;
  source: DataSource;
  data?: T;
  note?: string;
  /** When the underlying data was fetched/cached (ISO). */
  fetchedAt?: string;
};

export function unavailable<T>(source: DataSource, note: string): ProviderResult<T> {
  return { available: false, source, note };
}

export function ok<T>(source: DataSource, data: T, fetchedAt?: string): ProviderResult<T> {
  return { available: true, source, data, fetchedAt: fetchedAt ?? new Date().toISOString() };
}

// ── Search Console ────────────────────────────────────────────────────────────

export type SearchAnalyticsRow = {
  keys: string[]; // dimension values in the requested order (e.g. [query] or [page])
  clicks: number;
  impressions: number;
  ctr: number; // 0..1
  position: number; // average position
};

export type SearchAnalyticsQuery = {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dimensions?: ("query" | "page" | "date" | "country" | "device")[];
  rowLimit?: number;
  /** Restrict to a single page URL (used for per-article rankings). */
  page?: string;
};

export interface SearchConsoleProvider {
  readonly name: string;
  readonly configured: boolean;
  query(q: SearchAnalyticsQuery): Promise<ProviderResult<SearchAnalyticsRow[]>>;
}

// ── Keyword metrics (search volume / difficulty / CPC) ────────────────────────

export type KeywordMetrics = {
  keyword: string;
  searchVolume: number | null;
  difficulty: number | null; // 0..100
  cpc: number | null; // USD
  competition: number | null; // 0..1
};

export interface KeywordProvider {
  readonly name: string;
  readonly configured: boolean;
  metrics(keywords: string[], country?: string): Promise<ProviderResult<KeywordMetrics[]>>;
}

// ── SERP ──────────────────────────────────────────────────────────────────────

export type SerpResult = {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
};

export type SerpFeatures = {
  results: SerpResult[];
  features: string[]; // e.g. "featured_snippet", "people_also_ask"
  peopleAlsoAsk?: string[];
};

export interface SerpProvider {
  readonly name: string;
  readonly configured: boolean;
  analyze(keyword: string, country?: string): Promise<ProviderResult<SerpFeatures>>;
}

// ── Trends ──────────────────────────────────────────────────────────────────

export type TrendPoint = { date: string; value: number };
export type TrendResult = {
  keyword: string;
  timeline: TrendPoint[];
  momentumPct: number | null; // % change recent-vs-prior window
  direction: "rising" | "flat" | "declining" | "unknown";
  relatedRising?: string[];
};

export interface TrendsProvider {
  readonly name: string;
  readonly configured: boolean;
  trend(keyword: string, country?: string): Promise<ProviderResult<TrendResult>>;
}

// ── Backlinks / authority ─────────────────────────────────────────────────────

export type BacklinkMetrics = {
  domain: string;
  domainAuthority: number | null;
  referringDomains: number | null;
  backlinks: number | null;
};

export interface BacklinkProvider {
  readonly name: string;
  readonly configured: boolean;
  metrics(domain: string): Promise<ProviderResult<BacklinkMetrics>>;
}
