import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate disclosure",
  description: `How ${SITE_NAME} uses affiliate links and how we keep recommendations honest.`,
  alternates: { canonical: "/disclosure" },
};

export default function DisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose-article">
      <h1 className="text-4xl font-bold tracking-tight">Affiliate disclosure</h1>
      <p className="mt-4 text-foreground-muted">
        Last updated: August 18, 2026.
      </p>

      <div className="mt-8 space-y-6 text-foreground-muted leading-relaxed">
        <p>
          Some articles on {SITE_NAME} contain <strong>affiliate links</strong>. If you
          click one and buy a product or sign up for a service, we may earn a commission —
          at <strong>no additional cost to you</strong>. These commissions help fund the
          research and writing behind our content.
        </p>
        <p>
          <strong>Our recommendations are editorial.</strong> We only recommend tools we
          believe are genuinely useful for our readers. A company paying a commission does
          not buy a positive review, a ranking, or placement. When a relationship is paid,
          we say so.
        </p>
        <p>
          Every outbound recommendation link is tracked through our own redirect so we can
          understand what readers find useful. We do not sell your personal data, and
          clicking a link does not identify you personally to us.
        </p>
        <p>
          Prices, features and availability of third-party products change often. We do our
          best to keep details accurate, but always confirm the current details on the
          vendor&apos;s own site before purchasing.
        </p>
        <p>
          Questions about a specific recommendation? Use the{" "}
          <a href="/contact" className="text-foreground underline underline-offset-2">
            contact page
          </a>{" "}
          — corrections are welcome.
        </p>
      </div>
    </div>
  );
}
