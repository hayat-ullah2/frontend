// Provider registry. Business logic asks for a provider here and never names a
// vendor directly — so swapping/adding a data source is a one-line change and
// the rest of the SEO engine is untouched. Defaults are the Null providers,
// which report "unavailable" instead of ever fabricating data.

import {
  nullBacklink,
  nullKeyword,
  nullSerp,
  nullTrends,
} from "./null.js";
import { googleSearchConsole } from "./searchConsole.js";
import type {
  BacklinkProvider,
  KeywordProvider,
  SearchConsoleProvider,
  SerpProvider,
  TrendsProvider,
} from "./types.js";

export function getSearchConsoleProvider(): SearchConsoleProvider {
  // Only vendor wired in Phase 1. Falls back to reporting "not connected"
  // (via its own `configured` guard) when credentials are absent.
  return googleSearchConsole;
}

// Phase 1 leaves these as honest Null providers. To add a vendor later,
// implement the interface in ./providers/<vendor>.ts and return it here —
// nothing else in the codebase changes.
export function getKeywordProvider(): KeywordProvider {
  return nullKeyword;
}

export function getSerpProvider(): SerpProvider {
  return nullSerp;
}

export function getTrendsProvider(): TrendsProvider {
  return nullTrends;
}

export function getBacklinkProvider(): BacklinkProvider {
  return nullBacklink;
}

/** A snapshot of which real data sources are live — drives the Settings UI. */
export function providerStatus() {
  return {
    searchConsole: getSearchConsoleProvider().configured,
    keyword: getKeywordProvider().configured,
    serp: getSerpProvider().configured,
    trends: getTrendsProvider().configured,
    backlink: getBacklinkProvider().configured,
  };
}

export * from "./types.js";
