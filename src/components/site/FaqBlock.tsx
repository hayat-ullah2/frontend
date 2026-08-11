import type { ApiFaq } from "@/lib/models";

/**
 * Renders an article's FAQ section. Pairs with `faqSchema()` JSON-LD on the
 * page so the same Q&A can earn an FAQ rich result. Uses native <details> so it
 * works without JavaScript.
 */
export default function FaqBlock({
  faqs,
  className = "",
}: {
  faqs?: ApiFaq[];
  className?: string;
}) {
  const valid = (faqs ?? []).filter((f) => f.question?.trim() && f.answer?.trim());
  if (valid.length === 0) return null;

  return (
    <section className={`mt-12 ${className}`} aria-label="Frequently asked questions">
      <h2 className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
      <div className="mt-5 divide-y divide-white/5 rounded-2xl border border-white/10">
        {valid.map((f, i) => (
          <details key={i} className="group p-5 [&_summary]:cursor-pointer">
            <summary className="flex items-center justify-between gap-4 font-medium list-none">
              {f.question}
              <span className="text-foreground-subtle transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
              {f.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
