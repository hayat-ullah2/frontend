import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import {
  ArrowRight,
  Eye,
  FileText,
  Heart,
  MessageSquare,
  Plus,
  TrendUp,
  Users,
} from "@/components/Icon";
import { authors, categories, posts } from "@/lib/data";

const stats = [
  { label: "Total posts", value: posts.length.toString(), delta: "+12%", icon: FileText },
  { label: "Total users", value: "8,420", delta: "+4.1%", icon: Users },
  { label: "Page views", value: "482k", delta: "+18%", icon: Eye },
  { label: "Engagement", value: "62%", delta: "+2.4%", icon: Heart },
];

const traffic = [38, 55, 47, 71, 64, 88, 76, 90, 84, 95, 80, 100];

export default function AdminDashboardPage() {
  const recentPosts = [...posts]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 5);

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Welcome back — here's what happened this week."
        action={
          <Link href="/admin/blogs/new" className="btn-primary text-sm">
            <Plus size={14} /> New post
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
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
                <p className="mt-3 text-3xl font-bold tracking-tight">{s.value}</p>
                <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
                  <TrendUp size={12} /> {s.delta} this week
                </p>
              </div>
            );
          })}
        </div>

        {/* Chart + Top categories */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Traffic</h2>
                <p className="text-xs text-foreground-subtle">
                  Page views over the last 12 weeks
                </p>
              </div>
              <select className="bg-background border border-white/5 rounded-lg px-3 py-1.5 text-xs">
                <option>Last 12 weeks</option>
                <option>Last 30 days</option>
                <option>Last 7 days</option>
              </select>
            </div>
            <div className="mt-6 h-56 flex items-end gap-2">
              {traffic.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-md bg-gradient-to-t from-violet-500/60 to-blue-500/60 hover:from-violet-500 hover:to-blue-500 transition"
                  style={{ height: `${v}%` }}
                  title={`${v}k views`}
                />
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold">Top categories</h2>
            <p className="text-xs text-foreground-subtle">by published posts</p>
            <div className="mt-5 space-y-4">
              {categories.slice(0, 5).map((c) => {
                const pct = Math.min(100, Math.round((c.postCount / 60) * 100));
                return (
                  <div key={c.slug}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{c.name}</span>
                      <span className="text-foreground-subtle">{c.postCount}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${c.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent posts + activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h2 className="font-semibold">Recent posts</h2>
                <p className="text-xs text-foreground-subtle">
                  Latest 5 articles published
                </p>
              </div>
              <Link href="/admin/blogs" className="text-xs text-foreground-muted hover:text-foreground inline-flex items-center gap-1">
                See all <ArrowRight size={12} />
              </Link>
            </div>
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
                {recentPosts.map((p) => {
                  const author = authors.find((a) => a.slug === p.authorSlug);
                  const cat = categories.find((c) => c.slug === p.category);
                  return (
                    <tr key={p.slug} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <p className="font-medium line-clamp-1">{p.title}</p>
                        <p className="text-xs text-foreground-subtle">
                          {new Date(p.publishedAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="chip">{cat?.name}</span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
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
                      <td className="p-4 text-right text-foreground-muted">
                        {(p.views / 1000).toFixed(1)}k
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card p-6 space-y-5">
            <h2 className="font-semibold">Recent activity</h2>
            <div className="space-y-4 text-sm">
              {[
                { who: "Priya Shah", what: "published", what2: "The quiet revolution of agentic LLMs", when: "2h ago" },
                { who: "Alex Rivera", what: "drafted", what2: "Building resilient edge APIs", when: "5h ago" },
                { who: "Lena Fischer", what: "edited", what2: "Pricing is strategy", when: "Yesterday" },
                { who: "Marcus Chen", what: "moderated", what2: "12 comments", when: "Yesterday" },
                { who: "Sara Kowalski", what: "scheduled", what2: "The traveler's kit", when: "2 days ago" },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-accent text-white text-[10px] font-bold grid place-items-center flex-shrink-0">
                    {a.who.split(" ").map((s) => s[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground-muted">
                      <span className="text-foreground font-medium">{a.who}</span> {a.what}{" "}
                      <span className="text-foreground">{a.what2}</span>
                    </p>
                    <p className="text-xs text-foreground-subtle">{a.when}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
