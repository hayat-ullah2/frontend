"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, Close, Trash } from "@/components/Icon";
import { ApiError } from "@/lib/api";
import { deleteComment, updateCommentStatus } from "@/lib/comments";

export default function CommentActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function moderate(status: "approved" | "rejected") {
    start(async () => {
      try {
        await updateCommentStatus(id, status);
        router.refresh();
      } catch (err) {
        alert(err instanceof ApiError ? err.message : "Action failed.");
      }
    });
  }

  function remove() {
    if (!confirm("Delete this comment?")) return;
    start(async () => {
      try {
        await deleteComment(id);
        router.refresh();
      } catch (err) {
        alert(err instanceof ApiError ? err.message : "Delete failed.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => moderate("approved")}
        disabled={pending}
        aria-label="Approve"
        className="w-8 h-8 rounded-lg border border-white/5 grid place-items-center text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50"
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={() => moderate("rejected")}
        disabled={pending}
        aria-label="Reject"
        className="w-8 h-8 rounded-lg border border-white/5 grid place-items-center text-amber-300 hover:bg-amber-500/10 disabled:opacity-50"
      >
        <Close size={14} />
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label="Delete"
        className="w-8 h-8 rounded-lg border border-white/5 grid place-items-center text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
      >
        <Trash size={14} />
      </button>
    </div>
  );
}
