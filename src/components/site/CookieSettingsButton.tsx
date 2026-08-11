"use client";

import { openConsentPreferences } from "@/lib/consent";

/**
 * Re-opens the consent banner so visitors can change their cookie choices at
 * any time — required by GDPR/CCPA. Used in the footer and the Cookie Policy.
 */
export default function CookieSettingsButton({
  className = "",
  children = "Cookie settings",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" onClick={openConsentPreferences} className={className}>
      {children}
    </button>
  );
}
