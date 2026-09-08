// Google Search Console adapter — REAL data only.
//
// Auth: an OAuth2 *refresh token* (obtained once during setup, see
// SEO_AGENT_SETUP.md) is exchanged for a short-lived access token, which is
// cached in-process until shortly before expiry. All calls hit the official
// Search Analytics API — nothing here is estimated or invented.
//
// Keys live server-side only (env), never sent to the browser.

import { env } from "../../../config/env.js";
import {
  ok,
  unavailable,
  type ProviderResult,
  type SearchAnalyticsQuery,
  type SearchAnalyticsRow,
  type SearchConsoleProvider,
} from "./types.js";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_BASE = "https://www.googleapis.com/webmasters/v3";

type CachedToken = { accessToken: string; expiresAt: number };
let tokenCache: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  // Reuse the cached token until 60s before it expires.
  if (tokenCache && tokenCache.expiresAt - 60_000 > now) {
    return tokenCache.accessToken;
  }
  const { clientId, clientSecret, refreshToken } = env.gsc;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`Search Console token refresh failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("Search Console token refresh returned no access_token");
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  };
  return tokenCache.accessToken;
}

class GoogleSearchConsoleProvider implements SearchConsoleProvider {
  readonly name = "google-search-console";
  get configured(): boolean {
    const { clientId, clientSecret, refreshToken, siteUrl } = env.gsc;
    return Boolean(clientId && clientSecret && refreshToken && siteUrl);
  }

  async query(q: SearchAnalyticsQuery): Promise<ProviderResult<SearchAnalyticsRow[]>> {
    if (!this.configured) {
      return unavailable("unavailable", "Google Search Console credentials are incomplete.");
    }
    try {
      const token = await getAccessToken();
      const site = encodeURIComponent(env.gsc.siteUrl);
      const filters = q.page
        ? [{ dimension: "page", operator: "equals", expression: q.page }]
        : undefined;
      const res = await fetch(`${API_BASE}/sites/${site}/searchAnalytics/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: q.startDate,
          endDate: q.endDate,
          dimensions: q.dimensions ?? [],
          rowLimit: q.rowLimit ?? 250,
          ...(filters ? { dimensionFilterGroups: [{ filters }] } : {}),
        }),
      });
      if (!res.ok) {
        return unavailable("unavailable", `Search Console API error ${res.status}: ${await res.text()}`);
      }
      const data = (await res.json()) as { rows?: SearchAnalyticsRow[] };
      return ok("google-search-console", data.rows ?? []);
    } catch (err) {
      return unavailable("unavailable", `Search Console request failed: ${(err as Error).message}`);
    }
  }
}

export const googleSearchConsole = new GoogleSearchConsoleProvider();
