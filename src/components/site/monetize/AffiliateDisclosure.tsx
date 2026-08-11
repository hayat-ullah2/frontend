import Link from "next/link";

/**
 * FTC / white-hat affiliate disclosure. Shown near the top of any article that
 * recommends affiliate products. Honest, non-deceptive, and linked to the full
 * disclosure page.
 */
export default function AffiliateDisclosure({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-foreground-subtle ${className}`}
      role="note"
    >
      <span className="font-medium text-foreground-muted">Disclosure:</span>{" "}
      {compact
        ? "Some links below are affiliate links — we may earn a commission at no extra cost to you."
        : "This article contains affiliate links. If you buy through them we may earn a commission, at no additional cost to you. We only recommend tools we believe are genuinely useful. "}
      {!compact && (
        <Link href="/disclosure" className="underline underline-offset-2 hover:text-foreground">
          Learn more
        </Link>
      )}
    </div>
  );
}
