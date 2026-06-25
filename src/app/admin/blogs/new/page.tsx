import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import { ArrowLeft, Check, Eye, Tag } from "@/components/Icon";
import { authors, categories, tags } from "@/lib/data";

export default function NewBlogPostPage() {
  return (
    <>
      <Topbar
        title="Create new post"
        subtitle="Drafts autosave every 30 seconds."
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/blogs" className="btn-ghost text-sm">
              <ArrowLeft size={14} /> Cancel
            </Link>
            <button className="btn-ghost text-sm">
              <Eye size={14} /> Preview
            </button>
            <button className="btn-ghost text-sm">Save draft</button>
            <button className="btn-primary text-sm">
              <Check size={14} /> Publish
            </button>
          </div>
        }
      />

      <form className="p-6 grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-5">
            <Field
              label="Title"
              placeholder="A clear, specific, irresistible headline"
              className="text-2xl font-semibold"
            />
            <Field
              label="Slug"
              placeholder="a-clear-specific-headline"
              hint="URL: /blog/a-clear-specific-headline"
            />
            <Field
              label="Excerpt"
              as="textarea"
              rows={3}
              placeholder="One or two sentences that earn the click."
            />
          </div>

          <div className="card p-6 space-y-3">
            <Label>Content</Label>
            <div className="flex flex-wrap items-center gap-1 p-2 rounded-lg bg-background border border-white/10">
              {["B", "I", "U", "S", "H2", "H3", "“ ”", "{ }", "•", "1.", "🔗", "🖼"].map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    className="px-2.5 py-1 text-xs rounded-md hover:bg-white/5 text-foreground-muted"
                  >
                    {t}
                  </button>
                ),
              )}
            </div>
            <textarea
              rows={18}
              placeholder="Start writing the post…"
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none resize-y font-mono"
            />
            <div className="flex items-center justify-between text-xs text-foreground-subtle">
              <span>Supports markdown</span>
              <span>0 words · 0 min read</span>
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <div>
              <h3 className="font-semibold">SEO</h3>
              <p className="text-xs text-foreground-subtle">
                Override defaults for this post.
              </p>
            </div>
            <Field
              label="Meta title"
              placeholder="Defaults to post title if empty"
            />
            <Field
              label="Meta description"
              as="textarea"
              rows={2}
              placeholder="Defaults to excerpt if empty"
            />
            <Field label="Canonical URL" placeholder="https://…" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="OG image URL" placeholder="https://…" />
              <div>
                <Label>Index in search</Label>
                <select className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none">
                  <option>Index, follow</option>
                  <option>Noindex, follow</option>
                  <option>Noindex, nofollow</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Side column */}
        <aside className="space-y-6">
          <div className="card p-6 space-y-5">
            <h3 className="font-semibold">Publish settings</h3>
            <div>
              <Label>Status</Label>
              <select className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none">
                <option>Draft</option>
                <option>Published</option>
                <option>Scheduled</option>
              </select>
            </div>
            <Field label="Publish date" type="datetime-local" />
            <label className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-background border border-white/5 cursor-pointer">
              <span className="text-sm">Feature on homepage</span>
              <Toggle />
            </label>
            <label className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-background border border-white/5 cursor-pointer">
              <span className="text-sm">Mark as trending</span>
              <Toggle />
            </label>
            <label className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-background border border-white/5 cursor-pointer">
              <span className="text-sm">Allow comments</span>
              <Toggle defaultChecked />
            </label>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-semibold">Cover image</h3>
            <div className="aspect-[16/9] rounded-xl border border-dashed border-white/10 bg-background grid place-items-center text-center px-6">
              <div>
                <p className="text-sm text-foreground-muted">Drop an image here</p>
                <p className="text-xs text-foreground-subtle mt-1">
                  PNG, JPG, WebP up to 5 MB
                </p>
                <button
                  type="button"
                  className="btn-ghost text-xs mt-4"
                >
                  Choose file
                </button>
              </div>
            </div>
            <Field label="Or paste image URL" placeholder="https://images.unsplash.com/…" />
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-semibold">Organize</h3>
            <div>
              <Label>Category</Label>
              <select className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none">
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Author</Label>
              <select className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none">
                {authors.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.name} — {a.role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-white/10">
                <Tag size={14} />
                <input
                  placeholder="Type a tag and press enter"
                  className="bg-transparent outline-none border-0 text-sm w-full placeholder:text-foreground-subtle"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.slice(0, 8).map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    className="chip hover:text-foreground"
                  >
                    + {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-3">
            <h3 className="font-semibold">Danger zone</h3>
            <p className="text-xs text-foreground-subtle">
              Discard this draft and start over.
            </p>
            <button
              type="button"
              className="w-full rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-300 hover:bg-rose-500/10 text-sm py-2"
            >
              Discard draft
            </button>
          </div>
        </aside>
      </form>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
      {children}
    </label>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  as,
  rows,
  hint,
  className,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  as?: "textarea";
  rows?: number;
  hint?: string;
  className?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {as === "textarea" ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          className={`w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none resize-none placeholder:text-foreground-subtle focus:border-violet-500/40 transition ${className ?? ""}`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-foreground-subtle focus:border-violet-500/40 transition ${className ?? ""}`}
        />
      )}
      {hint && <p className="mt-1.5 text-xs text-foreground-subtle">{hint}</p>}
    </div>
  );
}

function Toggle({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <span className="relative inline-block w-9 h-5">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="absolute inset-0 rounded-full bg-white/10 peer-checked:bg-gradient-accent transition" />
      <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition peer-checked:translate-x-4" />
    </span>
  );
}
