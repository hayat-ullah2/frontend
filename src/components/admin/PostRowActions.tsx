"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Edit, Eye, Trash } from "@/components/Icon";
import { ApiError } from "@/lib/api";
import { deletePost, generateLocalizedVersion } from "@/lib/posts";
import { TARGET_COUNTRIES } from "@/lib/seo/geo";

export default function PostRowActions({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localizing, setLocalizing] = useState(false);

  function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    start(async () => {
      setError(null);
      try {
        await deletePost(slug);
        router.refresh();
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Delete failed.";
        setError(msg);
        alert(msg);
      }
    });
  }

  async function handleLocalize(code: string) {
    setMenuOpen(false);
    setLocalizing(true);
    try {
      const created = await generateLocalizedVersion(slug, code);
      router.push(`/admin/blogs/${created.slug}/edit`);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not create localized draft.");
    } finally {
      setLocalizing(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-1">
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          disabled={localizing}
          className="w-8 h-8 rounded-lg border border-white/5 hover:bg-white/5 grid place-items-center text-foreground-muted disabled:opacity-50"
          aria-label="Create localized version"
          title="Create localized draft for a country"
        >
          {localizing ? "…" : "🌐"}
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-1 w-52 max-h-64 overflow-auto rounded-lg border border-white/10 bg-background shadow-xl py-1">
              <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-foreground-subtle">
                Localize as a draft
              </p>
              {TARGET_COUNTRIES.filter((c) => c.code !== "global").map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleLocalize(c.code)}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-white/5 text-foreground-muted"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <Link
        href={`/blog/${slug}`}
        target="_blank"
        rel="noreferrer"
        prefetch={false}
        className="w-8 h-8 rounded-lg border border-white/5 hover:bg-white/5 grid place-items-center text-foreground-muted"
        aria-label="Preview"
      >
        <Eye size={14} />
      </Link>
      <Link
        href={`/admin/blogs/${slug}/edit`}
        className="w-8 h-8 rounded-lg border border-white/5 hover:bg-white/5 grid place-items-center text-foreground-muted"
        aria-label="Edit"
        title={error ?? "Edit post"}
      >
        <Edit size={14} />
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="w-8 h-8 rounded-lg border border-white/5 hover:bg-rose-500/10 grid place-items-center text-rose-300 disabled:opacity-50"
        aria-label="Delete"
      >
        <Trash size={14} />
      </button>
    </div>
  );
}
