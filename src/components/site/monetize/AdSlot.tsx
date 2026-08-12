"use client";

import { useEffect, useRef, useState } from "react";
import { CONSENT_EVENT, hasConsent } from "@/lib/consent";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

/**
 * A single display-ad placement. Behavior:
 *  • no publisher id configured → renders nothing in production (a labelled
 *    placeholder in dev so you can see where ads will go);
 *  • configured but no advertising consent → renders nothing;
 *  • configured + consent → renders a responsive AdSense unit.
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
  const [allowed, setAllowed] = useState(false);
  const pushed = useRef(false);
  const adSlot = slot ?? DEFAULT_SLOT;

  useEffect(() => {
    const check = () => setAllowed(hasConsent("advertising"));
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, []);

  useEffect(() => {
    if (allowed && CLIENT && adSlot && !pushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        /* AdSense not ready yet — it will retry on next fill */
      }
    }
  }, [allowed, adSlot]);

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

  // Configured, but the visitor hasn't allowed ads.
  if (!allowed) return null;

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
