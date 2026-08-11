"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, hasConsent } from "@/lib/consent";

// Publisher id, e.g. "ca-pub-1234567890123456". Set in .env.local once you're
// approved by Google AdSense. Until then this renders nothing.
const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * Loads the AdSense library — but only after the visitor grants advertising
 * consent, and only if a publisher id is configured. Mounted once in the root
 * layout.
 */
export default function AdsScript() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = () => setAllowed(hasConsent("advertising"));
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, []);

  if (!CLIENT || !allowed) return null;

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`}
    />
  );
}
