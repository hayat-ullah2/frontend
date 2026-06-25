import Topbar from "@/components/admin/Topbar";
import { Edit, Plus, Trash } from "@/components/Icon";
import { categories } from "@/lib/data";

export default function AdminCategoriesPage() {
  return (
    <>
      <Topbar
        title="Categories"
        subtitle={`${categories.length} categories · used across ${categories.reduce((s, c) => s + c.postCount, 0)} posts`}
        action={
          <button className="btn-primary text-sm">
            <Plus size={14} /> New category
          </button>
        }
      />

      <div className="p-6 grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <form className="card p-6 space-y-4 lg:col-span-1 h-fit">
          <h2 className="font-semibold">Create category</h2>
          <div>
            <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
              Name
            </label>
            <input
              placeholder="e.g. Productivity"
              className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
              Slug
            </label>
            <input
              placeholder="productivity"
              className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Short description for the category banner."
              className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
              Gradient
            </label>
            <div className="grid grid-cols-6 gap-2">
              {[
                "from-purple-500 to-fuchsia-500",
                "from-blue-500 to-cyan-400",
                "from-emerald-500 to-teal-400",
                "from-red-500 to-rose-400",
                "from-amber-500 to-orange-400",
                "from-indigo-500 to-blue-400",
              ].map((g, i) => (
                <button
                  key={i}
                  type="button"
                  className={`h-8 rounded-md bg-gradient-to-br ${g} ring-2 ring-transparent hover:ring-white/30 transition`}
                />
              ))}
            </div>
          </div>
          <button type="button" className="btn-primary w-full text-sm">
            Create category
          </button>
        </form>

        {/* List */}
        <div className="card lg:col-span-2 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-foreground-subtle">
              <tr className="border-b border-white/5">
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Slug</th>
                <th className="text-right p-4 font-medium">Posts</th>
                <th className="text-right p-4 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.slug} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.color} grid place-items-center text-white text-sm font-bold`}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-foreground-subtle line-clamp-1">
                          {c.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-foreground-subtle">/{c.slug}</td>
                  <td className="p-4 text-right">{c.postCount}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-1">
                      <button className="w-8 h-8 rounded-lg border border-white/5 hover:bg-white/5 grid place-items-center text-foreground-muted">
                        <Edit size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-lg border border-white/5 hover:bg-rose-500/10 grid place-items-center text-rose-300">
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
