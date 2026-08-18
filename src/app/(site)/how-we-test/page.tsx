import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "How we test",
  description: `How ${SITE_NAME} researches, scores and verifies the AI tools we cover — and how we label research-based vs. hands-on coverage.`,
  alternates: { canonical: "/how-we-test" },
};

export default function HowWeTestPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose-article">
      <h1 className="text-4xl font-bold tracking-tight">How we test</h1>
      <p className="mt-4 text-foreground-muted">
        We want you to know exactly how much confidence to place in each article,
        so here is our method — including what we have and haven&apos;t verified.
      </p>

      <div className="mt-8 space-y-8 text-foreground-muted leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-foreground" id="what-tested-means">
            What &ldquo;tested&rdquo; means at {SITE_NAME}
          </h2>
          <p className="mt-3">
            When we hands-on test a tool, it means we used a real account, ran a
            set of defined tasks, and kept the screenshots to back up what we
            report. A hands-on article will say so clearly and show its evidence.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground" id="where-we-are-today">
            Where we are today
          </h2>
          <p className="mt-3">
            Our hands-on testing program is being rolled out. Most of our current
            articles are <strong>research-based</strong> — built from each tool&apos;s
            live product pages, official documentation, pricing pages and public
            demos — and we label them that way. We never publish invented test
            scores, fake benchmarks or fabricated &ldquo;we tested&rdquo; claims.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground" id="how-we-score">
            How we score
          </h2>
          <p className="mt-3">Where we rate tools, we weigh four things:</p>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li><strong>Capability</strong> — what the tool can actually do.</li>
            <li><strong>Output quality</strong> — how good the results are for real work.</li>
            <li><strong>Price / value</strong> — what you get for the money, in USD.</li>
            <li><strong>Ease of use</strong> — how quickly you can get a result.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground" id="pricing-verification">
            Pricing verification
          </h2>
          <p className="mt-3">
            Prices change often. We check pricing on each vendor&apos;s official
            site and date it in the article. Always confirm the current price on
            the vendor&apos;s own site before you buy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground" id="corrections">
            Found something wrong?
          </h2>
          <p className="mt-3">
            Email{" "}
            <a href="mailto:hello@nexversal.com" className="text-foreground underline underline-offset-2">
              hello@nexversal.com
            </a>
            . We correct mistakes quickly and openly. See our{" "}
            <a href="/editorial-policy" className="text-foreground underline underline-offset-2">
              editorial policy
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
