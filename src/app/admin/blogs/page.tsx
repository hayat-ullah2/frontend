import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import { Edit, Eye, Filter, Heart, MessageSquare, Plus, Search, Trash } from "@/components/Icon";
import { authors, categories, posts } from "@/lib/data";

export default function AdminBlogsPage() {
  return (
    <>
      <Topbar
        title="Blog management"
        subtitle={`${posts.length} posts total · 12 drafts · 3 scheduled`}
        action={
          <Link href="/admin/blogs/new" className="btn-primary text-sm">
            <Plus size={14} /> New post
          </Link>
        }
      />

      <div className="p-6 space-y-5">
        {/* Filters */}
        <div className="card p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-white/5 w-full md:w-72">
            <Search size={16} />
            <input
              placeholder="Search posts…"
              className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full text-sm"
            />
          </div>
          <Select label="Status" options={["All", "Published", "Draft", "Scheduled"]} />
          <Select label="Category" options={["All", ...categories.map((c) => c.name)]} />
          <Select label="Sort" options={["Newest", "Most viewed", "Most liked"]} />
          <button className="btn-ghost text-sm ml-auto">
            <Filter size={14} /> More filters
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-foreground-subtle">
              <tr className="border-b border-white/5">
                <th className="text-left p-4 font-medium w-10">
                  <input type="checkbox" />
                </th>
                <th className="text-left p-4 font-medium">Post</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Category</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Author</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Status</th>
                <th className="text-right p-4 font-medium">Metrics</th>
                <th className="text-right p-4 font-medium w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p, i) => {
                const author = authors.find((a) => a.slug === p.authorSlug);
                const cat = categories.find((c) => c.slug === p.category);
                const status = i % 5 === 0 ? "Draft" : i % 7 === 0 ? "Scheduled" : "Published";
                return (
                  <tr
                    key={p.slug}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="p-4">
                      <input type="checkbox" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Image
                          src={p.cover}
                          alt=""
                          width={56}
                          height={40}
                          className="rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium line-clamp-1">{p.title}</p>
                          <p className="text-xs text-foreground-subtle line-clamp-1">
                            {p.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="chip">{cat?.name}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        {author && (
                          <Image
                            src={author.avatar}
                            alt={author.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        )}
                        <span className="text-xs">{author?.name}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <StatusBadge status={status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-xs text-foreground-subtle">
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {(p.views / 1000).toFixed(1)}k
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} /> {p.likes}
                        </span>
                        <span className="flex items-center gap-1 hidden xl:inline-flex">
                          <MessageSquare size={12} /> {p.comments}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <IconButton aria-label="Preview"><Eye size={14} /></IconButton>
                        <IconButton aria-label="Edit"><Edit size={14} /></IconButton>
                        <IconButton aria-label="Delete" tone="danger"><Trash size={14} /></IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-between p-4 border-t border-white/5 text-xs text-foreground-subtle">
            <p>Showing 1–{posts.length} of {posts.length}</p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 rounded-md hover:bg-white/5">Previous</button>
              <button className="px-3 py-1.5 rounded-md bg-white/5 text-foreground">1</button>
              <button className="px-3 py-1.5 rounded-md hover:bg-white/5">2</button>
              <button className="px-3 py-1.5 rounded-md hover:bg-white/5">3</button>
              <button className="px-3 py-1.5 rounded-md hover:bg-white/5">Next</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="relative">
      <select className="appearance-none bg-background border border-white/5 rounded-lg pl-3 pr-8 py-2 text-sm outline-none">
        {options.map((o) => (
          <option key={o}>{`${label}: ${o}`}</option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Published: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    Draft: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    Scheduled: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full border ${map[status]}`}>
      {status}
    </span>
  );
}

function IconButton({
  children,
  tone,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "danger" }) {
  return (
    <button
      {...rest}
      className={`w-8 h-8 rounded-lg border border-white/5 hover:border-white/15 grid place-items-center transition ${
        tone === "danger"
          ? "text-rose-300 hover:bg-rose-500/10"
          : "text-foreground-muted hover:text-foreground hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}
