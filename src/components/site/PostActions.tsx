"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { toggleBookmark, toggleLike } from "@/lib/posts";
import { Bookmark, Heart, MessageSquare } from "@/components/Icon";

type Props = {
  slug: string;
  initialLikes: number;
  initialCommentCount: number;
  initialLiked: boolean;
  initialBookmarked: boolean;
  isAuthed: boolean;
};

export default function PostActions({
  slug,
  initialLikes,
  initialCommentCount,
  initialLiked,
  initialBookmarked,
  isAuthed,
}: Props) {
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [busy, setBusy] = useState<"like" | "bookmark" | null>(null);

  async function handleLike() {
    if (!isAuthed) {
      router.push(`/login?next=/blog/${slug}`);
      return;
    }
    setBusy("like");
    // Optimistic update.
    const prev = { liked, likes };
    setLiked(!liked);
    setLikes(likes + (liked ? -1 : 1));
    try {
      const res = await toggleLike(slug);
      setLiked(res.liked);
      setLikes(res.likes);
    } catch (err) {
      // Roll back on failure.
      setLiked(prev.liked);
      setLikes(prev.likes);
      if (!(err instanceof ApiError) || err.status !== 429) {
        console.warn(err);
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleBookmark() {
    if (!isAuthed) {
      router.push(`/login?next=/blog/${slug}`);
      return;
    }
    setBusy("bookmark");
    const prev = bookmarked;
    setBookmarked(!bookmarked);
    try {
      const res = await toggleBookmark(slug);
      setBookmarked(res.bookmarked);
    } catch (err) {
      setBookmarked(prev);
      console.warn(err);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleLike}
        disabled={busy !== null}
        aria-label={liked ? "Unlike" : "Like"}
        aria-pressed={liked}
        title={isAuthed ? (liked ? "Unlike this post" : "Like this post") : "Log in to like"}
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition relative disabled:opacity-60 ${
          liked
            ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
            : "border-white/10 bg-background-elev text-foreground-muted hover:text-foreground hover:border-violet-500/40"
        }`}
      >
        <Heart size={16} />
        <span className="absolute -bottom-4 text-[10px] text-foreground-subtle">
          {likes}
        </span>
      </button>

      <Link
        href="#comments"
        scroll
        aria-label="Jump to comments"
        title="Read & write comments"
        className="w-10 h-10 rounded-full border border-white/10 bg-background-elev flex items-center justify-center text-foreground-muted hover:text-foreground hover:border-violet-500/40 transition relative"
      >
        <MessageSquare size={16} />
        <span className="absolute -bottom-4 text-[10px] text-foreground-subtle">
          {initialCommentCount}
        </span>
      </Link>

      <button
        type="button"
        onClick={handleBookmark}
        disabled={busy !== null}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark this post"}
        aria-pressed={bookmarked}
        title={isAuthed ? (bookmarked ? "Bookmarked" : "Save for later") : "Log in to bookmark"}
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition disabled:opacity-60 ${
          bookmarked
            ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
            : "border-white/10 bg-background-elev text-foreground-muted hover:text-foreground hover:border-violet-500/40"
        }`}
      >
        <Bookmark size={16} />
      </button>
    </>
  );
}
