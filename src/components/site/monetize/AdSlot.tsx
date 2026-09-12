"use client";

import { useEffect, useRef } from "react";
import { hasConsent } from "@/lib/consent";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[] & { requestNonPersonalizedAds?: number };
  }
}

/**
 * A single display-ad placement. Behavior:
 *  • no publisher id configured → renders nothing in production (a labelled
 *    placeholder in dev so you can see where ads will go);
 *  • configured, no advertising consent → renders a NON-personalized ad
 *    (GDPR-safe fallback; no ad-targeting cookies);
 *  • configured + advertising consent → renders a personalized AdSense unit.
 * Ads are shown to everyone so the site stays eligible for AdSense review and
 * earns on all traffic; personalization is what consent controls.
 * Reserves height to avoid layout shift (protects Core Web Vitals).
 */
export default function AdSlot({
  slot,
  className = "",
  minHeight = 280,
  label = true,
}: {
  slot?: string;
  className?: string;
  minHeight?: number;
  label?: boolean;
}) {
  const pushed = useRef(false);
  const adSlot = slot ?? DEFAULT_SLOT;

  useEffect(() => {
    if (CLIENT && adSlot && !pushed.current) {
      try {
        const ads = (window.adsbygoogle = window.adsbygoogle || []);
        // No advertising consent yet → ask Google for non-personalized ads
        // (no targeting cookies). With consent, ads are personalized (higher
        // revenue). Read consent synchronously at fill time so it's accurate.
        if (!hasConsent("advertising")) {
          ads.requestNonPersonalizedAds = 1;
        }
        ads.push({});
        pushed.current = true;
      } catch {
        /* AdSense not ready yet — it will retry on next fill */
      }
    }
  }, [adSlot]);

  // Nothing configured yet.
  if (!CLIENT || !adSlot) {
    if (process.env.NODE_ENV === "production") return null;
    return (
      <div
        className={`grid place-items-center rounded-xl border border-dashed border-white/15 px-3 text-center text-[11px] uppercase tracking-widest text-foreground-subtle break-words ${className}`}
        style={{ minHeight }}
        aria-hidden
      >
        Ad slot · set NEXT_PUBLIC_ADSENSE_CLIENT
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <p className="text-center text-[10px] uppercase tracking-widest text-foreground-subtle mb-1">
          Advertisement
        </p>
      )}
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight }}
        data-ad-client={CLIENT}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
