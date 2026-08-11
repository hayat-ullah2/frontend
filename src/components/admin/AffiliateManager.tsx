"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  createAffiliateLink,
  deleteAffiliateLink,
  updateAffiliateLink,
  type AffiliateLinkInput,
} from "@/lib/affiliate";
import type { ApiAffiliateLink } from "@/lib/models";
import { BarChart, Edit, Plus, Trash } from "@/components/Icon";

type FormState = {
  name: string;
  url: string;
  vendor: string;
  logo: string;
  niche: string;
  tagline: string;
  description: string;
  pricingNote: string;
  badge: string;
  ctaLabel: string;
  rating: string;
  pros: string;
  cons: string;
  useCases: string;
  epc: string;
  earnings: string;
  isAffiliate: boolean;
  active: boolean;
};

const EMPTY: FormState = {
  name: "",
  url: "",
  vendor: "",
  logo: "",
  niche: "",
  tagline: "",
  description: "",
  pricingNote: "",
  badge: "",
  ctaLabel: "",
  rating: "",
  pros: "",
  cons: "",
  useCases: "",
  epc: "",
  earnings: "",
  isAffiliate: true,
  active: true,
};

const lines = (s: string) =>
  s.split("\n").map((x) => x.trim()).filter(Boolean);
const fromLines = (a?: string[]) => (a ?? []).join("\n");
const num = (s: string) => (s.trim() === "" ? undefined : Number(s));

export default function AffiliateManager({
  initial,
}: {
  initial: ApiAffiliateLink[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(link: ApiAffiliateLink) {
    setEditingSlug(link.slug);
    setError(null);
    setForm({
      name: link.name ?? "",
      url: link.url ?? "",
      vendor: link.vendor ?? "",
      logo: link.logo ?? "",
      niche: link.niche ?? "",
      tagline: link.tagline ?? "",
      description: link.description ?? "",
      pricingNote: link.pricingNote ?? "",
      badge: link.badge ?? "",
      ctaLabel: link.ctaLabel ?? "",
      rating: link.rating != null ? String(link.rating) : "",
      pros: fromLines(link.pros),
      cons: fromLines(link.cons),
      useCases: fromLines(link.useCases),
      epc: link.epc != null ? String(link.epc) : "",
      earnings: link.earnings != null ? String(link.earnings) : "",
      isAffiliate: link.isAffiliate !== false,
      active: link.active !== false,
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingSlug(null);
    setForm(EMPTY);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.url.trim()) {
      setError("Name and destination URL are required.");
      return;
    }
    const payload: AffiliateLinkInput = {
      name: form.name.trim(),
      url: form.url.trim(),
      vendor: form.vendor.trim() || undefined,
      logo: form.logo.trim() || undefined,
      niche: form.niche.trim() || undefined,
      tagline: form.tagline.trim() || undefined,
      description: form.description.trim() || undefined,
      pricingNote: form.pricingNote.trim() || undefined,
      badge: form.badge.trim() || undefined,
      ctaLabel: form.ctaLabel.trim() || undefined,
      rating: num(form.rating),
      pros: lines(form.pros),
      cons: lines(form.cons),
      useCases: lines(form.useCases),
      epc: num(form.epc),
      earnings: num(form.earnings),
      isAffiliate: form.isAffiliate,
      active: form.active,
    };

    setSaving(true);
    try {
      if (editingSlug) await updateAffiliateLink(editingSlug, payload);
      else await createAffiliateLink(payload);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the link.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string, name: string) {
    if (!window.confirm(`Delete “${name}”? It will be removed from any articles that use it.`))
      return;
    try {
      await deleteAffiliateLink(slug);
      if (editingSlug === slug) reset();
      router.refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not delete.");
    }
  }

  return (
    <div className="p-6 grid xl:grid-cols-3 gap-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-3 xl:col-span-1 h-fit">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            {editingSlug ? "Edit tool" : "Add tool"}
          </h2>
          {editingSlug && (
            <button
              type="button"
              onClick={reset}
              className="text-xs text-foreground-subtle hover:text-foreground"
            >
              Cancel
            </button>
          )}
        </div>

        <Field label="Name *" value={form.name} onChange={(v) => set("name", v)} placeholder="Notion" />
        <Field
          label="Destination URL * (your affiliate link)"
          value={form.url}
          onChange={(v) => set("url", v)}
          placeholder="https://vendor.com/?ref=you"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vendor" value={form.vendor} onChange={(v) => set("vendor", v)} placeholder="Notion Labs" />
          <Field label="Niche" value={form.niche} onChange={(v) => set("niche", v)} placeholder="Productivity" />
        </div>
        <Field label="Logo URL" value={form.logo} onChange={(v) => set("logo", v)} placeholder="https://…/logo.png" />
        <Field label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} placeholder="All-in-one workspace" />
        <TextArea label="Description" value={form.description} onChange={(v) => set("description", v)} rows={3} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pricing note" value={form.pricingNote} onChange={(v) => set("pricingNote", v)} placeholder="Free · $10/mo Pro" />
          <Field label="Badge" value={form.badge} onChange={(v) => set("badge", v)} placeholder="Editor's choice" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTA label" value={form.ctaLabel} onChange={(v) => set("ctaLabel", v)} placeholder="Try Notion" />
          <Field label="Rating (0–5)" value={form.rating} onChange={(v) => set("rating", v)} placeholder="4.5" type="number" />
        </div>
        <TextArea label="Pros (one per line)" value={form.pros} onChange={(v) => set("pros", v)} rows={3} />
        <TextArea label="Cons (one per line)" value={form.cons} onChange={(v) => set("cons", v)} rows={3} />
        <TextArea label="Best for (one per line)" value={form.useCases} onChange={(v) => set("useCases", v)} rows={2} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="EPC ($/click, optional)" value={form.epc} onChange={(v) => set("epc", v)} placeholder="0.45" type="number" />
          <Field label="Earnings ($ total)" value={form.earnings} onChange={(v) => set("earnings", v)} placeholder="120" type="number" />
        </div>
        <div className="flex flex-wrap gap-4 pt-1">
          <Toggle label="Affiliate link" checked={form.isAffiliate} onChange={(v) => set("isAffiliate", v)} />
          <Toggle label="Active" checked={form.active} onChange={(v) => set("active", v)} />
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-xs px-3 py-2">
            {error}
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-primary w-full text-sm disabled:opacity-60">
          {saving ? "Saving…" : editingSlug ? "Save changes" : (
            <>
              <Plus size={14} /> Add tool
            </>
          )}
        </button>
      </form>

      {/* Table */}
      <div className="card xl:col-span-2 overflow-hidden h-fit">
        {initial.length === 0 ? (
          <div className="p-12 text-center text-sm text-foreground-subtle">
            No affiliate tools yet. Add your first recommendation on the left, then attach it to articles.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-foreground-subtle">
              <tr className="border-b border-white/5">
                <th className="text-left p-4 font-medium">Tool</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Niche</th>
                <th className="text-right p-4 font-medium">
                  <span className="inline-flex items-center gap-1"><BarChart size={12} /> Clicks</span>
                </th>
                <th className="text-right p-4 font-medium">Earnings</th>
                <th className="text-right p-4 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initial.map((l) => (
                <tr key={l._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{l.name}</span>
                      {l.active === false && (
                        <span className="text-[10px] uppercase tracking-wider text-foreground-subtle border border-white/10 rounded px-1.5 py-0.5">
                          inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground-subtle truncate max-w-[280px]">{l.url}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell text-foreground-subtle">{l.niche ?? "—"}</td>
                  <td className="p-4 text-right tabular-nums">{l.clicks ?? 0}</td>
                  <td className="p-4 text-right tabular-nums">
                    {l.earnings ? `$${l.earnings}` : "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(l)}
                        className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-white/5"
                        aria-label={`Edit ${l.name}`}
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(l.slug, l.name)}
                        className="p-2 rounded-lg text-rose-300 hover:bg-rose-500/10"
                        aria-label={`Delete ${l.name}`}
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1">
        {label}
      </label>
      <input
        type={type}
        step={type === "number" ? "any" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500/40"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500/40 resize-none"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground-muted cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-white/20"
      />
      {label}
    </label>
  );
}
