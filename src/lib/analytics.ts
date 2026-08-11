// First-party, privacy-light event tracking. Fires small beacons to the API's
// public /events endpoint. No PII, no cookies required — a random per-browser
// session id (localStorage) lets the backend count unique visitors without
// identifying anyone. All calls are best-effort and never throw.

import { sendGAEvent } from "@next/third-parties/google";
import { API_BASE_URL } from "./api";

export type EventType =
  | "pageview"
  | "outbound_click"
  | "cta_click"
  | "product_click"
  | "newsletter_signup";

const SESSION_KEY = "nx_sid";

export function getSessionId(): string | undefined {
  return sessionId();
}

function sessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

type TrackPayload = {
  path?: string;
  postSlug?: string;
  label?: string;
};

type GAEventParams = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(action: string, params: GAEventParams = {}): void {
  if (
    typeof window === "undefined" ||
    process.env.NODE_ENV !== "production" ||
    !process.env.NEXT_PUBLIC_GA_ID ||
    !action
  ) {
    return;
  }

  try {
    sendGAEvent("event", action, params);
  } catch {
    /* never let GA break the page */
  }
}

export function track(type: EventType, payload: TrackPayload = {}): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    type,
    path: payload.path ?? window.location.pathname,
    referrer: document.referrer || undefined,
    sessionId: sessionId(),
    ...payload,
  });

  try {
    // keepalive lets the request survive a navigation (e.g. outbound clicks).
    void fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      // Events are anonymous — no need to attach auth cookies.
      credentials: "omit",
    }).catch(() => {});
  } catch {
    /* never let analytics break the page */
  }
}

export const trackPageview = (postSlug?: string) =>
  track("pageview", { postSlug });

export const trackCta = (label: string, path?: string) =>
  track("cta_click", { label, path });

export const trackProductClick = (label: string, postSlug?: string) =>
  track("product_click", { label, postSlug });
