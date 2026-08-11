import Link from "next/link";
import type { Metadata } from "next";
import Newsletter from "@/components/site/Newsletter";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "The AI Tools Starter Kit",
  description:
    "A practical, no-hype checklist for choosing AI and developer tools that are actually worth paying for.",
  alternates: { canonical: "/resources/ai-tools-starter-kit" },
};

const sections = [
  {
    h: "1. Define the job before the tool",
    items: [
      "Write the one sentence: “I want to ___ in less time / with less effort.”",
      "Note how often you'll do it — daily tasks justify paid tools; rare ones rarely do.",
      "Decide your ceiling: free, <$20/mo, or team budget.",
    ],
  },
  {
    h: "2. Evaluate any tool in 15 minutes",
    items: [
      "Does the free tier actually let you finish one real task end-to-end?",
      "Time-to-first-value: are you productive in under 10 minutes?",
      "Does it export your data in an open format if you leave?",
      "Is pricing per-seat, usage-based, or flat — and how does it scale for you?",
      "Is there a real human/community when it breaks?",
    ],
  },
  {
    h: "3. The categories worth a paid tool (2026)",
    items: [
      "AI coding assistant — the biggest daily time-saver for most developers.",
      "AI writing / editing — for docs, emails and content, if you write a lot.",
      "Knowledge base (notes/wiki) — where your team's context lives.",
      "Automation / no-code glue — connect the apps you already pay for.",
      "Hosting / deployment — the one bill that should just work.",
    ],
  },
  {
    h: "4. Red flags that waste money",
    items: [
      "“AI” bolted on with no clear task it does better than free tools.",
      "No export — your data is hostage.",
      "Aggressive annual-only pricing before you've proven value.",
      "A demo that looks great but stalls the moment you use real data.",
    ],
  },
  {
    h: "5. Your 30-day trial plan",
    items: [
      "Pick ONE category with the biggest pain. Ignore the rest for now.",
      "Trial two tools against the same real task, same week.",
      "Keep the one that saved the most time — cancel the other immediately.",
      "Re-evaluate every quarter; tools and pricing change fast.",
    ],
  },
];

export default function StarterKitPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-xs uppercase tracking-wider text-foreground-subtle">Free resource</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">The AI Tools Starter Kit</h1>
      <p className="mt-4 text-foreground-muted leading-relaxed">
        A short, honest checklist for choosing AI &amp; developer tools that are worth paying for —
        and skipping the ones that aren&apos;t. Bookmark this page; we&apos;ve also emailed you a copy.
      </p>

      <div className="prose-article mt-10">
        {sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            <ul>
              {s.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-white/10 bg-background-elev p-6">
        <p className="text-sm text-foreground-muted">
          When you&apos;re comparing specific tools, our{" "}
          <Link href="/blog" className="text-foreground underline underline-offset-2">
            comparison guides
          </Link>{" "}
          do the 15-minute test for you — with honest pros, cons and pricing.
        </p>
      </div>

      <section className="mt-14">
        <Newsletter source="resource:ai-tools-starter-kit" />
      </section>

      <p className="mt-8 text-xs text-foreground-subtle">
        © {SITE_NAME}. Share the link freely.
      </p>
    </div>
  );
}
