import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Editorial policy",
  description: `${SITE_NAME}'s standards on independence, corrections, AI assistance and sourcing.`,
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose-article">
      <h1 className="text-4xl font-bold tracking-tight">Editorial policy</h1>
      <p className="mt-4 text-foreground-muted">
        These are the standards every {SITE_NAME} article is held to.
      </p>

      <div className="mt-8 space-y-8 text-foreground-muted leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-foreground" id="independence">
            Independence
          </h2>
          <p className="mt-3">
            Our recommendations are editorial. Affiliate commissions{" "}
            <strong>never</strong> affect our rankings, scores or verdicts. A
            company paying a commission cannot buy a positive review or placement.
            When a link is an affiliate link, we disclose it — see our{" "}
            <a href="/disclosure" className="text-foreground underline underline-offset-2">
              affiliate disclosure
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground" id="ai-assistance">
            AI assistance
          </h2>
          <p className="mt-3">
            We use AI tools in research and drafting. Every article is
            human-edited, fact-checked, and accountable to a named author. We do
            not publish unedited AI output, and we do not fabricate testing,
            benchmarks, credentials or quotes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground" id="corrections">
            Corrections
          </h2>
          <p className="mt-3">
            If we get something wrong, tell us at{" "}
            <a href="mailto:hello@nexversal.com" className="text-foreground underline underline-offset-2">
              hello@nexversal.com
            </a>
            . We aim to review and correct verified errors within 24–72 hours, and
            we note material corrections openly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground" id="sourcing">
            Sourcing
          </h2>
          <p className="mt-3">
            We rely on primary sources first: each tool&apos;s live product,
            official documentation and pricing pages, plus reputable reporting and
            public demos. Prices and features change, so we date what we verify and
            ask you to confirm details on the vendor&apos;s own site. See{" "}
            <a href="/how-we-test" className="text-foreground underline underline-offset-2">
              how we test
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
