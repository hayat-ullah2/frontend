"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Edit, Trash } from "@/components/Icon";
import { ApiError } from "@/lib/api";
import { deleteCategory } from "@/lib/categories";

export default function CategoryRowActions({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`Delete category "${name}"?`)) return;
    start(async () => {
      setError(null);
      try {
        await deleteCategory(slug);
        router.refresh();
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Delete failed.";
        alert(msg);
      }
    });
  }

  return (
    <div className="inline-flex gap-1">
      <button
        type="button"
        className="w-8 h-8 rounded-lg border border-white/5 hover:bg-white/5 grid place-items-center text-foreground-muted"
        title="Edit (coming soon)"
      >
        <Edit size={14} />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="w-8 h-8 rounded-lg border border-white/5 hover:bg-rose-500/10 grid place-items-center text-rose-300 disabled:opacity-50"
      >
        <Trash size={14} />
      </button>
    </div>
  );
}
