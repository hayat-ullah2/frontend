"use client";

import Script from "next/script";

// Publisher id, e.g. "ca-pub-1234567890123456". Set in .env.local once you're
// approved by Google AdSense. Until then this renders nothing.
// Strip stray whitespace/newlines that can ride along when the id is pasted
// into a hosting env var — a trailing newline would corrupt the script URL.
const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.replace(/\s+/g, "") || undefined;

/**
 * Loads the AdSense library whenever a publisher id is configured. The loader
 * is intentionally NOT gated behind cookie consent: Google's review crawler
 * (and the ongoing ads crawler) must be able to find this script on every page,
 * otherwise approval fails with "we couldn't find the AdSense code on your
 * site." The loader alone does not serve personalized ads or set advertising
 * cookies — that decision is made per ad unit in AdSlot, which falls back to
 * non-personalized ads when the visitor hasn't granted advertising consent.
 * Mounted once in the root layout.
 */
export default function AdsScript() {
  if (!CLIENT) return null;

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`}
    />
  );
}
