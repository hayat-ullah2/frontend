"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/Icon";
import { trackCta } from "@/lib/analytics";

/**
 * Reusable, relevance-first call-to-action block. Use for "Get the checklist",
 * "Compare tools", "Join the newsletter", etc. Every click is tracked so the
 * dashboard can attribute conversions to specific CTAs.
 */
export default function CTABox({
  title,
  body,
  ctaLabel,
  href,
  trackLabel,
  external = false,
  className = "",
}: {
  title: string;
  body?: string;
  ctaLabel: string;
  href: string;
  trackLabel?: string;
  external?: boolean;
  className?: string;
}) {
  const label = trackLabel ?? title;
  const inner = (
    <>
      {ctaLabel} <ArrowRight size={14} />
    </>
  );

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-blue-500/[0.06] p-6 ${className}`}
    >
      <h3 className="text-lg font-bold tracking-tight">{title}</h3>
      {body && <p className="mt-2 text-sm text-foreground-muted max-w-xl">{body}</p>}
      <div className="mt-4">
        {external ? (
          <a
            href={href}
            target="_blank"
            rel="noopener"
            onClick={() => trackCta(label)}
            className="btn-primary text-sm"
          >
            {inner}
          </a>
        ) : (
          <Link href={href} onClick={() => trackCta(label)} className="btn-primary text-sm">
            {inner}
          </Link>
        )}
      </div>
    </div>
  );
}
