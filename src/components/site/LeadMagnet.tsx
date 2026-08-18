"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import { subscribe } from "@/lib/inbound";
import { ArrowRight, Check, Sparkles } from "../Icon";

/**
 * Email-gated lead magnet. Captures name + email in exchange for a free
 * resource, kicks off the welcome sequence (which delivers the resource by
 * email too), and reveals the download link immediately on success.
 */
export default function LeadMagnet({
  slug,
  title,
  description,
  bullets = [],
  resourceHref,
  buttonLabel = "Send me the free resource",
  compact = false,
}: {
  slug: string;
  title: string;
  description: string;
  bullets?: string[];
  resourceHref: string;
  buttonLabel?: string;
  compact?: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return;
    setSaving(true);
    try {
      await subscribe({
        email: email.trim(),
        name: name.trim() || undefined,
        source: `lead-magnet:${slug}`,
        leadMagnet: slug,
      });
      track("newsletter_signup", { label: `lead-magnet:${slug}` });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.10] to-blue-500/[0.06] ${compact ? "p-5" : "p-6 sm:p-8"}`}
    >
      <span className="chip">
        <Sparkles size={12} /> Free resource
      </span>

      {done ? (
        <div className="mt-4">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Check size={18} className="text-emerald-400" /> You&apos;re all set
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Thanks for subscribing — here&apos;s your copy. Open it right now:
          </p>
          <Link href={resourceHref} className="btn-primary text-sm mt-4">
            Open the resource <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          <h3 className={`mt-3 font-bold tracking-tight ${compact ? "text-lg" : "text-2xl"}`}>{title}</h3>
          <p className="mt-2 text-sm text-foreground-muted max-w-lg">{description}</p>

          {bullets.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                  <Check size={15} className="mt-0.5 shrink-0 text-violet-400" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-2.5">
            {!compact && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name (optional)"
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-foreground-subtle focus:border-violet-500/40"
              />
            )}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-foreground-subtle focus:border-violet-500/40"
              />
              <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-60">
                {saving ? "Sending…" : buttonLabel}
              </button>
            </div>
            <p className="text-[11px] text-foreground-subtle">
              No spam. Unsubscribe anytime. See our{" "}
              <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </form>

          {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        </>
      )}
    </div>
  );
}
