import Link from "next/link";
import type { Metadata } from "next";
import LegalShell from "@/components/site/LegalShell";
import { SITE_NAME } from "@/lib/site";

const UPDATED = "August 10, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses and protects your personal information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated={UPDATED}
      intro={`This policy explains what information ${SITE_NAME} ("we", "us") collects when you use this website, why we collect it, and the choices and rights you have. We aim to collect as little as possible and to be transparent about the rest.`}
    >
      <h2>1. Information we collect</h2>
      <p><strong>Information you provide.</strong> When you create an account we store your name, email address and password (hashed, never in plain text). If you subscribe to our newsletter we store your email address. If you post a comment or contact us, we store the content you submit and the name/email attached to it.</p>
      <p><strong>Information collected automatically.</strong> When analytics consent is granted, we record privacy-light, first-party usage events — pages viewed, and clicks on links, calls-to-action and recommended tools. These events do <em>not</em> contain your name, email or IP address; a random, non-identifying browser id is used only to estimate unique visitors. Our servers also keep standard technical logs for security and reliability.</p>
      <p><strong>Cookies and similar technologies.</strong> We use a small number of cookies and local storage entries. See our <Link href="/cookies">Cookie Policy</Link> for the full list and how to control them.</p>

      <h2>2. How we use information</h2>
      <ul>
        <li>To provide core features — accounts, sign-in, comments, likes and bookmarks.</li>
        <li>To send the newsletter you asked for (you can unsubscribe at any time).</li>
        <li>To measure traffic and improve our content (only with analytics consent).</li>
        <li>To show and measure advertising (only with advertising consent).</li>
        <li>To keep the site secure and prevent abuse.</li>
      </ul>

      <h2>3. Legal bases (GDPR / Swiss FADP)</h2>
      <p>Where the GDPR or Swiss data-protection law applies, we rely on: <strong>performance of a contract</strong> (running your account), <strong>consent</strong> (newsletter, analytics and advertising cookies), and our <strong>legitimate interests</strong> (site security and preventing abuse). You can withdraw consent at any time without affecting prior processing.</p>

      <h2>4. Advertising</h2>
      <p>If you consent to advertising cookies, we may display ads served by third-party ad networks (for example, Google AdSense). These partners may use cookies to show and measure ads. You can opt out of personalized advertising through your consent choices here and via Google&apos;s <a href="https://adssettings.google.com" target="_blank" rel="noopener">Ad Settings</a>. If you decline advertising cookies, no ad-network scripts are loaded.</p>

      <h2>5. Affiliate links</h2>
      <p>Some articles contain affiliate links. When you click one, the outbound click is recorded (without identifying you) and you are redirected to the partner&apos;s site, where their own privacy policy applies. See our <Link href="/disclosure">Affiliate Disclosure</Link> for details.</p>

      <h2>6. Who we share information with</h2>
      <p>We do not sell your personal information. We share it only with service providers who help us run the site, under contracts that limit their use of it, including: our hosting and database providers; our image host (Cloudinary); our email/newsletter provider; and, with your consent, analytics and advertising partners. We may also disclose information where legally required.</p>

      <h2>7. Data retention</h2>
      <p>We keep account data while your account is active, newsletter data until you unsubscribe, and aggregate analytics for as long as it is useful for understanding trends. You can ask us to delete your data at any time (see your rights below).</p>

      <h2>8. Your rights</h2>
      <p>Depending on where you live (including under the GDPR, Swiss FADP and California&apos;s CCPA/CPRA), you may have the right to access, correct, delete or export your personal data, to object to or restrict certain processing, and to withdraw consent. To exercise any of these, contact us via the <Link href="/contact">contact page</Link>. We will not discriminate against you for exercising these rights.</p>

      <h2>9. International transfers</h2>
      <p>Our providers may process data in countries other than yours. Where required, we rely on appropriate safeguards (such as standard contractual clauses) for these transfers.</p>

      <h2>10. Security</h2>
      <p>We use industry-standard measures — encrypted connections, hashed passwords and access controls — to protect your data. No method of transmission or storage is perfectly secure, but we work to protect your information and to address issues promptly.</p>

      <h2>11. Children</h2>
      <p>This site is not directed to children under 16, and we do not knowingly collect their personal data. If you believe a child has provided us information, contact us and we will delete it.</p>

      <h2>12. Changes to this policy</h2>
      <p>We may update this policy from time to time. Material changes will be reflected by the &ldquo;Last updated&rdquo; date above, and where appropriate we will ask for renewed consent.</p>

      <h2>13. Contact</h2>
      <p>Questions about this policy or your data? Reach us through the <Link href="/contact">contact page</Link>.</p>
    </LegalShell>
  );
}
