import Image from "next/image";
import Link from "next/link";
import FilterBar from "@/components/FilterBar";
import PostRowActions from "@/components/admin/PostRowActions";
import Topbar from "@/components/admin/Topbar";
import { Edit, Eye, Heart, MessageSquare, Plus } from "@/components/Icon";
import { apiServerSafe } from "@/lib/apiServer";
import type { ApiCategory, ApiPost } from "@/lib/models";

export default async function AdminBlogsPage(props: PageProps<"/admin/blogs">) {
  const sp = await props.searchParams;
  const q = first(sp.q);
  const status = first(sp.status);
  const category = first(sp.category);

  const params = new URLSearchParams({ limit: "100" });
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (category) params.set("category", category);

  const [posts, categories] = await Promise.all([
    apiServerSafe<ApiPost[]>(`/posts?${params.toString()}`, []),
    apiServerSafe<ApiCategory[]>("/categories", []),
  ]);

  const counts = posts.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <Topbar
        title="Blog management"
        subtitle={`${posts.length} posts · ${counts.published ?? 0} published · ${counts.draft ?? 0} drafts · ${counts.scheduled ?? 0} scheduled`}
        action={
          <Link href="/admin/blogs/new" className="btn-primary text-sm">
            <Plus size={14} /> New post
          </Link>
        }
      />

      <div className="p-6 space-y-5">
        <div className="card p-4">
          <FilterBar
            fields={[
              { type: "search", name: "q", placeholder: "Search posts…" },
              {
                type: "select",
                name: "status",
                label: "Status",
                options: [
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "archived", label: "Archived" },
                ],
              },
              {
                type: "select",
                name: "category",
                label: "Category",
                options: categories.map((c) => ({ value: c.slug, label: c.name })),
              },
            ]}
          />
        </div>

        <div className="card overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-foreground-muted">No posts match your filters.</p>
              <Link href="/admin/blogs/new" className="btn-primary text-sm mt-4 inline-flex">
                <Plus size={14} /> Create a post
              </Link>
            </div>
          ) : (
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
                {posts.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="p-4">
                      <input type="checkbox" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {p.cover && (
                          <Image
                            src={p.cover}
                            alt=""
                            width={56}
                            height={40}
                            className="rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium line-clamp-1">{p.title}</p>
                          <p className="text-xs text-foreground-subtle line-clamp-1">
                            {p.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="chip">{p.category?.name}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-xs">
                      {p.author?.name}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-xs text-foreground-subtle">
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {formatNum(p.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} /> {p.likes}
                        </span>
                        <span className="hidden xl:inline-flex items-center gap-1">
                          <MessageSquare size={12} /> {p.commentCount}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <PostRowActions slug={p.slug} title={p.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {posts.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-white/5 text-xs text-foreground-subtle">
              <p>Showing 1–{posts.length} of {posts.length}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    draft: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    scheduled: "text-blue-300 bg-blue-500/10 border-blue-500/20",
    archived: "text-foreground-subtle bg-white/5 border-white/10",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full border capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
