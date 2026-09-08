// High-level Search Console helpers built on the provider. Everything here
// returns real GSC data or an explicit "unavailable" result — never estimates.

import { getSearchConsoleProvider } from "./providers/index.js";
import type { GscTotals } from "./intelligence/siteProfile.js";
import type { ProviderResult, SearchAnalyticsRow } from "./providers/types.js";

function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/** GSC has ~2-3 day latency; default window is last 28 days ending 3 days ago. */
function defaultRange(days = 28): { startDate: string; endDate: string } {
  return { startDate: daysAgo(days + 3), endDate: daysAgo(3) };
}

export async function getSiteTotals(days = 28): Promise<GscTotals | null> {
  const provider = getSearchConsoleProvider();
  if (!provider.configured) return null;
  const range = defaultRange(days);
  const res = await provider.query({ ...range, dimensions: [], rowLimit: 1 });
  if (!res.available || !res.data?.length) {
    // No rows can mean genuinely zero traffic — represent as zeros, still real.
    if (res.available) {
      return { clicks: 0, impressions: 0, ctr: 0, position: 0, ...range };
    }
    return null;
  }
  const r = res.data[0];
  return {
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: Number((r.ctr * 100).toFixed(2)),
    position: Number(r.position.toFixed(1)),
    ...range,
  };
}

export type QuickWin = {
  query: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

/**
 * "Quick wins": queries where we already rank in positions 8–20 with real
 * impressions — the classic band where a title/meta/content tweak can move us
 * onto page one. Purely from Search Console.
 */
export async function getQuickWins(days = 28, limit = 25): Promise<ProviderResult<QuickWin[]>> {
  const provider = getSearchConsoleProvider();
  const range = defaultRange(days);
  const res = await provider.query({ ...range, dimensions: ["query", "page"], rowLimit: 1000 });
  if (!res.available) return { available: false, source: res.source, note: res.note };
  const rows = (res.data ?? []) as SearchAnalyticsRow[];
  const wins = rows
    .filter((r) => r.position >= 8 && r.position <= 20 && r.impressions >= 20)
    .map((r) => ({
      query: r.keys[0] ?? "",
      page: r.keys[1],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: Number((r.ctr * 100).toFixed(2)),
      position: Number(r.position.toFixed(1)),
    }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, limit);
  return { available: true, source: "google-search-console", data: wins, fetchedAt: res.fetchedAt };
}

/** Real ranking rows for one article URL. */
export async function getPageRankings(pageUrl: string, days = 28): Promise<ProviderResult<QuickWin[]>> {
  const provider = getSearchConsoleProvider();
  const range = defaultRange(days);
  const res = await provider.query({ ...range, dimensions: ["query"], page: pageUrl, rowLimit: 100 });
  if (!res.available) return { available: false, source: res.source, note: res.note };
  const rows = (res.data ?? []) as SearchAnalyticsRow[];
  const out = rows
    .map((r) => ({
      query: r.keys[0] ?? "",
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: Number((r.ctr * 100).toFixed(2)),
      position: Number(r.position.toFixed(1)),
    }))
    .sort((a, b) => a.position - b.position);
  return { available: true, source: "google-search-console", data: out, fetchedAt: res.fetchedAt };
}
