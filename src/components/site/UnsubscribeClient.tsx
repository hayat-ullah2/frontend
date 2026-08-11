"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { unsubscribe } from "@/lib/inbound";

type State = "idle" | "working" | "done" | "error";

export default function UnsubscribeClient({ email: initial }: { email: string }) {
  const [email, setEmail] = useState(initial);
  const [state, setState] = useState<State>("idle");

  async function run(addr: string) {
    if (!addr.trim()) return;
    setState("working");
    try {
      await unsubscribe(addr.trim());
      setState("done");
    } catch {
      setState("error");
    }
  }

  // If the email came in via the link, unsubscribe automatically.
  useEffect(() => {
    if (initial) void run(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 p-6">
        <p className="font-semibold">You&apos;ve been unsubscribed.</p>
        <p className="mt-1 text-sm opacity-80">
          You won&apos;t receive any more emails from us. Changed your mind? You can{" "}
          <Link href="/" className="underline">resubscribe from the homepage</Link> anytime.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void run(email);
      }}
      className="space-y-3"
    >
      <p className="text-sm text-foreground-muted">
        Enter your email to unsubscribe from all {`Nexversal`} emails.
      </p>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-foreground-subtle focus:border-violet-500/40"
        />
        <button type="submit" disabled={state === "working"} className="btn-primary text-sm disabled:opacity-60">
          {state === "working" ? "Unsubscribing…" : "Unsubscribe"}
        </button>
      </div>
      {state === "error" && (
        <p className="text-xs text-rose-300">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
