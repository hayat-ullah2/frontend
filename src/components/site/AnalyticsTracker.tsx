"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { CONSENT_EVENT, hasConsent } from "@/lib/consent";

/**
 * Global first-party pageview tracker. Mounted once in the root layout; fires a
 * `pageview` event on load and on every client-side navigation — but only when
 * the visitor has granted analytics consent. Skips the admin panel.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const fire = () => {
      if (hasConsent("analytics")) track("pageview", { path: pathname });
    };
    fire();

    // If the visitor grants consent after landing, count this pageview then.
    const onConsent = () => fire();
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, [pathname]);

  return null;
}
