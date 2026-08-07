import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import {
  ArrowRight,
  Eye,
  FileText,
  Heart,
  Plus,
  TrendUp,
  Users,
} from "@/components/Icon";
import { apiServerSafe } from "@/lib/apiServer";
import type { ApiCategory, DashboardStats } from "@/lib/models";

const EMPTY_STATS: DashboardStats = {
  users: { total: 0, active: 0 },
  posts: { total: 0, published: 0, draft: 0, scheduled: 0 },
  categories: { total: 0 },
  comments: { pending: 0 },
  views: 0,
  likes: 0,
  recentPosts: [],
  recentUsers: [],
};

export default async function AdminDashboardPage() {
  const [stats, categories] = await Promise.all([
    apiServerSafe<DashboardStats>("/stats/dashboard", EMPTY_STATS),
    apiServerSafe<ApiCategory[]>("/categories", []),
  ]);

  const statCards = [
    { label: "Total posts", value: stats.posts.total, sub: `${stats.posts.published} published`, icon: FileText },
    { label: "Total users", value: stats.users.total, sub: `${stats.users.active} active`, icon: Users },
    { label: "Page views", value: stats.views, sub: "all time", icon: Eye },
    { label: "Total likes", value: stats.likes, sub: "across all posts", icon: Heart },
  ];

  const topCategories = [...categories]
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 5);
  const maxCat = Math.max(1, ...topCategories.map((c) => c.postCount));

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Welcome back — here's what's live in production."
        action={
          <Link href="/admin/blogs/new" className="btn-primary text-sm">
            <Plus size={14} /> New post
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-foreground-subtle uppercase tracking-wider">
                    {s.label}
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-white/5 grid place-items-center text-foreground-muted">
                    <Icon size={16} />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {formatNum(s.value)}
                </p>
                <p className="mt-1 text-xs text-foreground-subtle">{s.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Content health</h2>
                <p className="text-xs text-foreground-subtle">
                  Posts by status across the workspace
                </p>
              </div>
              <span className="chip">
                <TrendUp size={12} /> Live
              </span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-6">
              <Pill label="Published" value={stats.posts.published} tone="success" />
              <Pill label="Draft" value={stats.posts.draft} tone="warning" />
              <Pill label="Scheduled" value={stats.posts.scheduled} tone="info" />
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-foreground-subtle uppercase tracking-wider">
                  Comments pending review
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {stats.comments.pending}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-subtle uppercase tracking-wider">
                  Categories
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {stats.categories.total}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold">Top categories</h2>
            <p className="text-xs text-foreground-subtle">by published posts</p>
            <div className="mt-5 space-y-4">
              {topCategories.length === 0 && (
                <p className="text-xs text-foreground-subtle">No categories yet.</p>
              )}
              {topCategories.map((c) => (
                <div key={c._id}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="text-foreground-subtle">{c.postCount}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${c.color}`}
                      style={{ width: `${(c.postCount / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h2 className="font-semibold">Recent posts</h2>
                <p className="text-xs text-foreground-subtle">
                  Latest articles published
                </p>
              </div>
              <Link
                href="/admin/blogs"
                className="text-xs text-foreground-muted hover:text-foreground inline-flex items-center gap-1"
              >
                See all <ArrowRight size={12} />
              </Link>
            </div>
            {stats.recentPosts.length === 0 ? (
              <div className="p-10 text-center text-foreground-subtle text-sm">
                No posts yet. <Link href="/admin/blogs/new" className="text-foreground underline underline-offset-2">Create one</Link>.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs text-foreground-subtle">
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium hidden sm:table-cell">Category</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">Author</th>
                    <th className="text-right p-4 font-medium">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPosts.map((p) => (
                    <tr key={p._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <p className="font-medium line-clamp-1">{p.title}</p>
                        <p className="text-xs text-foreground-subtle">
                          {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : "—"}
                        </p>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="chip">{p.category?.name}</span>
                      </td>
                      <td className="p-4 hidden md:table-cell text-xs">
                        {p.author?.name}
                      </td>
                      <td className="p-4 text-right text-foreground-muted">
                        {formatNum(p.views)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">New users</h2>
              <Link href="/admin/users" className="text-xs text-foreground-muted hover:text-foreground">
                All users →
              </Link>
            </div>
            <p className="text-xs text-foreground-subtle">Recent sign-ups</p>
            <div className="mt-5 space-y-3">
              {stats.recentUsers.length === 0 && (
                <p className="text-xs text-foreground-subtle">No users yet.</p>
              )}
              {stats.recentUsers.map((u) => (
                <div key={u._id} className="flex items-center gap-3">
                  {u.avatar ? (
                    <Image
                      src={u.avatar}
                      alt={u.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-accent grid place-items-center text-white text-xs font-bold">
                      {initials(u.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-foreground-subtle truncate">{u.email}</p>
                  </div>
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-foreground-subtle">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Pill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "info";
}) {
  const map = {
    success: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    warning: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    info: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  } as const;
  return (
    <div className={`rounded-xl border p-4 ${map[tone]}`}>
      <p className="text-xs uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
