"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { postComment } from "@/lib/comments";

export default function CommentForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (content.trim().length < 2) {
      setError("Comment is too short.");
      return;
    }
    setSaving(true);
    try {
      await postComment(slug, content.trim());
      setSuccess("Comment submitted — awaiting moderation.");
      setContent("");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Please log in to post a comment.");
      } else {
        setError(err instanceof ApiError ? err.message : "Could not post comment.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-5 p-5">
      <textarea
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add to the conversation…"
        className="w-full bg-transparent border-0 outline-none resize-none placeholder:text-foreground-subtle"
      />
      {error && (
        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-xs px-3 py-2">
          {error}{" "}
          {error.includes("log in") && (
            <Link href="/login" className="underline">
              Log in
            </Link>
          )}
        </div>
      )}
      {success && (
        <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs px-3 py-2">
          {success}
        </div>
      )}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
        <p className="text-xs text-foreground-subtle">
          Be respectful. Comments are reviewed before being published.
        </p>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-sm disabled:opacity-60"
        >
          {saving ? "Posting…" : "Post comment"}
        </button>
      </div>
    </form>
  );
}
