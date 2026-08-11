"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  OPEN_CONSENT_EVENT,
  readConsent,
  saveConsent,
} from "@/lib/consent";

/**
 * GDPR/CCPA-style consent banner. Opt-in: nothing non-essential runs until the
 * visitor chooses. Appears on first visit (or when re-opened from the footer),
 * and never blocks the page — the site is fully usable behind it.
 */
export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [advertising, setAdvertising] = useState(true);

  useEffect(() => {
    // Show only if no valid decision has been recorded yet.
    if (!readConsent()) setOpen(true);
    const reopen = () => {
      const c = readConsent();
      setAnalytics(c ? c.analytics : true);
      setAdvertising(c ? c.advertising : true);
      setShowPrefs(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!open) return null;

  function decide(a: boolean, ad: boolean) {
    saveConsent({ analytics: a, advertising: ad });
    setOpen(false);
    setShowPrefs(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-background-elev/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h2 className="font-semibold text-sm">We value your privacy</h2>
            <p className="mt-1.5 text-xs text-foreground-muted leading-relaxed">
              We use cookies to run the site and, with your consent, to measure traffic and
              show relevant ads. You can accept, reject non-essential cookies, or choose what
              to allow. See our{" "}
              <Link href="/cookies" className="underline hover:text-foreground">Cookie Policy</Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>

            {showPrefs && (
              <div className="mt-4 space-y-2.5">
                <PrefRow
                  label="Strictly necessary"
                  desc="Required for sign-in, security and core features. Always on."
                  checked
                  disabled
                />
                <PrefRow
                  label="Analytics"
                  desc="Anonymous, first-party traffic measurement. No personal data."
                  checked={analytics}
                  onChange={setAnalytics}
                />
                <PrefRow
                  label="Advertising"
                  desc="Lets our ad partners show and measure relevant ads."
                  checked={advertising}
                  onChange={setAdvertising}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:justify-end">
          {!showPrefs && (
            <button
              type="button"
              onClick={() => setShowPrefs(true)}
              className="btn-ghost text-xs order-3 sm:order-1"
            >
              Preferences
            </button>
          )}
          <button
            type="button"
            onClick={() => decide(false, false)}
            className="btn-ghost text-xs order-2"
          >
            Reject non-essential
          </button>
          {showPrefs ? (
            <button
              type="button"
              onClick={() => decide(analytics, advertising)}
              className="btn-primary text-xs order-1 sm:order-3"
            >
              Save choices
            </button>
          ) : (
            <button
              type="button"
              onClick={() => decide(true, true)}
              className="btn-primary text-xs order-1 sm:order-3"
            >
              Accept all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PrefRow({
  label,
  desc,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-xl border border-white/10 bg-background p-3 ${
        disabled ? "opacity-70" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 rounded border-white/20"
      />
      <span className="min-w-0">
        <span className="block text-xs font-medium">{label}</span>
        <span className="block text-[11px] text-foreground-subtle leading-relaxed">{desc}</span>
      </span>
    </label>
  );
}
