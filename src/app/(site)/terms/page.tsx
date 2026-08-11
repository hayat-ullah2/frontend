import Link from "next/link";
import type { Metadata } from "next";
import LegalShell from "@/components/site/LegalShell";
import { SITE_NAME } from "@/lib/site";

const UPDATED = "August 10, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern your use of ${SITE_NAME}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated={UPDATED}
      intro={`These terms govern your use of ${SITE_NAME}. By accessing or using the site, you agree to them. If you don't agree, please don't use the site.`}
    >
      <h2>1. Using the site</h2>
      <p>You may read, share and link to our content for personal, non-commercial use. You agree not to misuse the site — including attempting to break security, scraping at scale, disrupting the service, or using it for anything unlawful.</p>

      <h2>2. Accounts</h2>
      <p>Some features require an account. You are responsible for keeping your credentials secure and for activity under your account. You must provide accurate information and be at least 16 years old. We may suspend or close accounts that violate these terms.</p>

      <h2>3. User content</h2>
      <p>You are responsible for anything you post (for example, comments). Don&apos;t post content that is unlawful, hateful, infringing, spammy or misleading. By posting, you grant us a non-exclusive, worldwide, royalty-free licence to display and distribute that content on the site. We may remove content or moderate comments at our discretion.</p>

      <h2>4. Intellectual property</h2>
      <p>The articles, design, logos and code on {SITE_NAME} are owned by us or our licensors and are protected by intellectual-property laws. You may not copy, republish or create derivative works from our content without permission, except for normal quoting with attribution and a link.</p>

      <h2>5. Affiliate links and third-party sites</h2>
      <p>We link to third-party products and websites, some through affiliate links (see our <Link href="/disclosure">Affiliate Disclosure</Link>). We don&apos;t control those sites and aren&apos;t responsible for their content, products, or practices. Any dealings you have with them are between you and them.</p>

      <h2>6. No professional advice</h2>
      <p>Our content is for general information only and is not professional, financial, legal or technical advice. Verify important details independently before acting on anything you read here.</p>

      <h2>7. Disclaimers</h2>
      <p>The site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, to the fullest extent permitted by law. We don&apos;t warrant that the site will be uninterrupted, error-free, or that information is always accurate or current.</p>

      <h2>8. Limitation of liability</h2>
      <p>To the fullest extent permitted by law, {SITE_NAME} and its team will not be liable for any indirect, incidental or consequential damages arising from your use of the site, or for reliance on any content.</p>

      <h2>9. Indemnity</h2>
      <p>You agree to indemnify and hold us harmless from claims arising out of your misuse of the site or your violation of these terms.</p>

      <h2>10. Changes</h2>
      <p>We may update these terms from time to time. Continued use after changes means you accept the updated terms. The &ldquo;Last updated&rdquo; date above shows when they last changed.</p>

      <h2>11. Governing law</h2>
      <p>These terms are governed by the laws of the operator&apos;s jurisdiction, without regard to conflict-of-laws rules. Update this section to name the specific jurisdiction that applies to you.</p>

      <h2>12. Contact</h2>
      <p>Questions about these terms? Reach us through the <Link href="/contact">contact page</Link>.</p>
    </LegalShell>
  );
}
