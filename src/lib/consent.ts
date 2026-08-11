// GDPR / CCPA-style cookie consent. Opt-in by default: analytics and
// advertising stay OFF until the visitor agrees. "Necessary" (auth, security)
// is always on and never tracked here. Consent is stored client-side and other
// components (analytics beacon, ad scripts) read it before doing anything.

export type ConsentCategory = "necessary" | "analytics" | "advertising";

export type Consent = {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  ts: number; // when the choice was made (epoch ms)
  v: number; // policy version — bump to re-ask everyone
};

const KEY = "nx_consent";
export const CONSENT_VERSION = 1;

/** Fired on window whenever consent changes. */
export const CONSENT_EVENT = "nx:consent";
/** Fired to (re)open the preferences banner, e.g. from the footer link. */
export const OPEN_CONSENT_EVENT = "nx:consent-open";

export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    if (!c || c.v !== CONSENT_VERSION) return null; // stale policy → re-ask
    return c;
  } catch {
    return null;
  }
}

export function saveConsent(input: { analytics: boolean; advertising: boolean }): Consent {
  const c: Consent = {
    necessary: true,
    analytics: input.analytics,
    advertising: input.advertising,
    ts: Date.now(),
    v: CONSENT_VERSION,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* storage blocked — consent simply won't persist */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: c }));
  }
  return c;
}

/** Has the visitor granted a given category? Necessary is always true. */
export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  const c = readConsent();
  if (!c) return false; // no decision yet → treat as declined
  return !!c[category];
}

/** Ask the banner to open (used by "Cookie settings" in the footer). */
export function openConsentPreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT));
  }
}
