"use client";

import { GoogleTagManager } from "@next/third-parties/google";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, hasConsent } from "@/lib/consent";

/**
 * Loads Google Tag Manager only after analytics consent. This keeps GTM aligned
 * with the existing cookie banner instead of injecting tags before consent.
 */
export default function GoogleTagManagerConsent({ gtmId }: { gtmId: string }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = () => setAllowed(hasConsent("analytics"));
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, []);

  if (!allowed) return null;
  return <GoogleTagManager gtmId={gtmId} />;
}
