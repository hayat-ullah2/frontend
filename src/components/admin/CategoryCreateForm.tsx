"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { createCategory } from "@/lib/categories";

const GRADIENTS = [
  "from-purple-500 to-fuchsia-500",
  "from-blue-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-red-500 to-rose-400",
  "from-amber-500 to-orange-400",
  "from-indigo-500 to-blue-400",
];

export default function CategoryCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(GRADIENTS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please add a name.");
      return;
    }
    setSaving(true);
    try {
      await createCategory({ name: name.trim(), description: description.trim() || undefined, color });
      setName("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create category.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 lg:col-span-1 h-fit">
      <h2 className="font-semibold">Create category</h2>
      <div>
        <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Productivity"
          className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description for the category banner."
          className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none resize-none"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
          Gradient
        </label>
        <div className="grid grid-cols-6 gap-2">
          {GRADIENTS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setColor(g)}
              className={`h-8 rounded-md bg-gradient-to-br ${g} ring-2 transition ${
                color === g ? "ring-white/60" : "ring-transparent hover:ring-white/30"
              }`}
            />
          ))}
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-xs px-3 py-2">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={saving}
        className="btn-primary w-full text-sm disabled:opacity-60"
      >
        {saving ? "Creating…" : "Create category"}
      </button>
    </form>
  );
}
