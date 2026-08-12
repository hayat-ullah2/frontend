"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, hasConsent } from "@/lib/consent";

/**
 * Loads Google Analytics 4 only after the visitor grants analytics consent.
 * Until then GA is never injected, so no GA cookies are set and no data is sent
 * — keeping GA4 consistent with our GDPR/CCPA cookie banner. Re-evaluates when
 * the visitor changes their choice.
 */
export default function GoogleAnalyticsConsent({ gaId }: { gaId: string }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = () => setAllowed(hasConsent("analytics"));
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, []);

  if (!allowed) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
