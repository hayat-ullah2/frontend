"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "@/components/Icon";
import { getSessionId, trackProductClick } from "@/lib/analytics";

/**
 * The single CTA that sends a reader to an affiliate destination. Always routes
 * through the tracked `/go/:slug` redirect and is marked rel="sponsored nofollow"
 * so it is white-hat and never passes link equity.
 */
export default function OutboundButton({
  slug,
  label = "Visit site",
  name,
  postSlug,
  variant = "primary",
  className = "",
}: {
  slug: string;
  label?: string;
  name?: string;
  postSlug?: string;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  // The session id lives in localStorage, so it only exists on the client.
  // Resolve it *after* mount to keep the first client render identical to the
  // server-rendered href (otherwise: hydration mismatch).
  const [sid, setSid] = useState<string | null>(null);
  useEffect(() => {
    setSid(getSessionId() ?? null);
  }, []);

  const params = new URLSearchParams();
  if (postSlug) params.set("from", postSlug);
  if (sid) params.set("sid", sid);
  const href = `/go/${slug}${params.toString() ? `?${params}` : ""}`;

  const base =
    variant === "primary"
      ? "btn-primary"
      : "btn-ghost";

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      onClick={() => trackProductClick(name ?? slug, postSlug)}
      className={`${base} text-sm ${className}`}
    >
      {label} <ArrowRight size={14} />
    </a>
  );
}
