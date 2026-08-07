"use client";

import { useEffect, useState } from "react";
import { Share } from "@/components/Icon";

export default function ShareButton({
  url,
  title,
  className,
}: {
  url?: string;
  title?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setResolvedUrl(url ?? window.location.href);
    }
  }, [url]);

  async function handleClick() {
    const link = resolvedUrl || (typeof window !== "undefined" ? window.location.href : "");
    if (!link) return;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url: link });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "w-10 h-10 rounded-full border border-white/10 bg-background-elev flex items-center justify-center text-foreground-muted hover:text-foreground hover:border-violet-500/40 transition relative"
      }
      title={copied ? "Link copied" : "Share"}
    >
      <Share size={16} />
      {copied && (
        <span className="absolute -bottom-5 text-[10px] text-emerald-300 whitespace-nowrap">
          Copied!
        </span>
      )}
    </button>
  );
}
