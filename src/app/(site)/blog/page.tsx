import Link from "next/link";
import type { Metadata } from "next";
import ArticleCard from "@/components/site/ArticleCard";
import { ArrowLeft, ArrowRight, Filter, Search } from "@/components/Icon";
import { categories, posts, tags } from "@/lib/data";

export const metadata: Metadata = {
  title: "All Articles",
  description: "Browse every article on NexBlog. Filter by category, tag, or topic.",
};

export default function BlogListingPage() {
  const sorted = [...posts].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <span className="chip">Library</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
            All articles
          </h1>
          <p className="mt-2 text-foreground-muted max-w-2xl">
            {posts.length} carefully edited pieces across {categories.length} categories.
            Use the filters to narrow down to what you care about.
          </p>
        </div>

        {/* Search + Sort */}
        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-background-elev border border-white/5">
            <Search size={18} />
            <input
              placeholder="Search by title, topic, or author…"
              className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <select className="w-full appearance-none bg-background-elev border border-white/5 rounded-xl px-4 py-3 text-sm pr-10 outline-none">
                <option>Latest</option>
                <option>Trending</option>
                <option>Most viewed</option>
                <option>Most liked</option>
                <option>Oldest first</option>
              </select>
              <Filter
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-10 mt-10">
        {/* Filters sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="flex flex-col gap-1">
              <FilterPill href="/blog" label="All" active />
              {categories.map((c) => (
                <FilterPill key={c.slug} href={`/category/${c.slug}`} label={c.name} count={c.postCount} />
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-4">Popular tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Link
                  key={t.slug}
                  href={`/blog?tag=${t.slug}`}
                  className="chip hover:text-foreground"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="lg:col-span-3">
          <div className="grid sm:grid-cols-2 gap-6">
            {sorted.map((p) => (
              <ArticleCard key={p.slug} post={p} />
            ))}
          </div>

          {/* Pagination */}
          <nav className="mt-12 flex items-center justify-between">
            <button className="btn-ghost text-sm" disabled>
              <ArrowLeft size={14} /> Previous
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`w-10 h-10 rounded-lg text-sm transition ${
                    n === 1
                      ? "bg-gradient-accent text-white font-semibold"
                      : "text-foreground-muted hover:bg-white/5"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="px-2 text-foreground-subtle">…</span>
              <button className="w-10 h-10 rounded-lg text-sm text-foreground-muted hover:bg-white/5">
                12
              </button>
            </div>
            <button className="btn-ghost text-sm">
              Next <ArrowRight size={14} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
        active
          ? "bg-white/5 text-foreground"
          : "text-foreground-muted hover:text-foreground hover:bg-white/5"
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className="text-xs text-foreground-subtle">{count}</span>
      )}
    </Link>
  );
}
