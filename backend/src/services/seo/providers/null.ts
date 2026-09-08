// Default "not connected" providers. They never fabricate — they report that
// the data source is unavailable so the UI can honestly render "Data unavailable"
// and prompt the admin to connect the integration in SEO Agent → Settings.

import {
  unavailable,
  type BacklinkProvider,
  type KeywordProvider,
  type SearchConsoleProvider,
  type SerpProvider,
  type TrendsProvider,
} from "./types.js";

const NOT_CONNECTED = (what: string) =>
  `${what} is not connected. Add credentials in SEO Agent → Settings to enable real data.`;

export const nullSearchConsole: SearchConsoleProvider = {
  name: "none",
  configured: false,
  async query() {
    return unavailable("unavailable", NOT_CONNECTED("Google Search Console"));
  },
};

export const nullKeyword: KeywordProvider = {
  name: "none",
  configured: false,
  async metrics() {
    return unavailable("unavailable", NOT_CONNECTED("A keyword-metrics provider"));
  },
};

export const nullSerp: SerpProvider = {
  name: "none",
  configured: false,
  async analyze() {
    return unavailable("unavailable", NOT_CONNECTED("A SERP provider"));
  },
};

export const nullTrends: TrendsProvider = {
  name: "none",
  configured: false,
  async trend() {
    return unavailable("unavailable", NOT_CONNECTED("A trends provider"));
  },
};

export const nullBacklink: BacklinkProvider = {
  name: "none",
  configured: false,
  async metrics() {
    return unavailable("unavailable", NOT_CONNECTED("A backlink provider"));
  },
};
