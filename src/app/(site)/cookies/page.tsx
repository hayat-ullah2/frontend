import Link from "next/link";
import type { Metadata } from "next";
import CookieSettingsButton from "@/components/site/CookieSettingsButton";
import LegalShell from "@/components/site/LegalShell";
import { SITE_NAME } from "@/lib/site";

const UPDATED = "August 10, 2026";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `Which cookies ${SITE_NAME} uses and how to control them.`,
  alternates: { canonical: "/cookies" },
};

const categories = [
  {
    name: "Strictly necessary",
    always: true,
    desc: "Keep you signed in, remember your consent choice, and protect the site. The site can't work without these, so they don't need consent.",
  },
  {
    name: "Analytics",
    always: false,
    desc: "Let us count visits and see which content is useful, using anonymous first-party events. No personal data, no cross-site tracking.",
  },
  {
    name: "Advertising",
    always: false,
    desc: "Allow our ad partners (e.g. Google AdSense) to show and measure relevant ads. Loaded only if you allow this category.",
  },
];

export default function CookiesPage() {
  return (
    <LegalShell
      title="Cookie Policy"
      updated={UPDATED}
      intro={`This policy explains how ${SITE_NAME} uses cookies and similar technologies, and how you can control them.`}
    >
      <h2>What cookies are</h2>
      <p>Cookies are small text files stored on your device. We also use your browser&apos;s local storage for a few things (like remembering your consent choice). Together we refer to them as &ldquo;cookies&rdquo; here.</p>

      <h2>The categories we use</h2>
      <div className="not-prose my-6 grid gap-3">
        {categories.map((c) => (
          <div key={c.name} className="rounded-xl border border-white/10 bg-background-elev p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-sm text-foreground">{c.name}</span>
              <span
                className={`text-[10px] uppercase tracking-wider rounded px-2 py-0.5 border ${
                  c.always
                    ? "text-emerald-300 border-emerald-500/30"
                    : "text-foreground-subtle border-white/15"
                }`}
              >
                {c.always ? "Always on" : "Consent required"}
              </span>
            </div>
            <p className="mt-2 text-sm text-foreground-muted leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>

      <h2>Managing your choices</h2>
      <p>You chose your preferences when you first visited. You can change them at any time:</p>
      <p className="not-prose my-4">
        <CookieSettingsButton className="btn-primary text-sm" />
      </p>
      <p>You can also block or delete cookies in your browser settings, though some features may stop working if you block necessary cookies. For advertising, you can additionally manage personalization via Google&apos;s <a href="https://adssettings.google.com" target="_blank" rel="noopener">Ad Settings</a>.</p>

      <h2>Related policies</h2>
      <p>See our <Link href="/privacy">Privacy Policy</Link> for how we handle personal data, and our <Link href="/disclosure">Affiliate Disclosure</Link> for how outbound links work.</p>
    </LegalShell>
  );
}
