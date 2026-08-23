import Link from "next/link";
import type { Metadata } from "next";
import ArticleCard from "@/components/site/ArticleCard";
import FilterBar from "@/components/FilterBar";
import { apiPublicSafe } from "@/lib/apiServer";
import type { ApiCategory, ApiPost, ApiTag } from "@/lib/models";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

// P4.14 — Regenerate every 5 minutes.
// 60s fallback; the /api/revalidate webhook refreshes this instantly on publish.
export const revalidate = 60;

export async function generateMetadata(
  props: PageProps<"/blog">,
): Promise<Metadata> {
  const sp = await props.searchParams;
  const q = first(sp.q);
  const tag = first(sp.tag);

  // Task 6 — any parameterized /blog (filters, search, sort, pagination) is
  // noindex,follow and canonicalizes to the clean /blog. Plain /blog stays
  // indexable. This kills thin/duplicate filtered pages from the index while
  // still letting Google follow the links on them.
  const sort = first(sp.sort);
  const hasParams = Boolean(q || tag || sort || first(sp.page));
  const canonicalPath = "/blog";

  const title =
    q ? `Search: “${q}”` : tag ? `#${tag}` : "All articles";
  const description =
    q || tag
      ? `Articles filtered by ${q ? `"${q}"` : `#${tag}`} on ${SITE_NAME}.`
      : `Browse every article on ${SITE_NAME}. Filter by category, tag, or topic.`;

  return {
    title,
    description,
    robots: hasParams ? { index: false, follow: true } : undefined,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonicalPath),
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/opengraph-image")],
    },
  };
}

export default async function BlogListingPage(props: PageProps<"/blog">) {
  const sp = await props.searchParams;
  const q = first(sp.q);
  const tag = first(sp.tag);
  const sort = first(sp.sort) ?? "latest";

  const params = new URLSearchParams({ limit: "1000" });
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);

  const [posts, categories, tags] = await Promise.all([
    apiPublicSafe<ApiPost[]>(`/posts?${params.toString()}`, []),
    apiPublicSafe<ApiCategory[]>("/categories", []),
    apiPublicSafe<ApiTag[]>("/tags", []),
  ]);

  const sorted = sortPosts(posts, sort);
  const totalPublishedPosts = categories.reduce(
    (sum, category) => sum + (category.postCount ?? 0),
    0,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="flex flex-col gap-4">
        <div>
          <span className="chip">Library</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
            {q ? `Results for "${q}"` : tag ? `#${tag}` : "All articles"}
          </h1>
          <p className="mt-2 text-foreground-muted max-w-2xl">
            {sorted.length} matching {sorted.length === 1 ? "post" : "posts"} across{" "}
            {categories.length} categories.
          </p>
        </div>

        <FilterBar
          className="mt-4"
          fields={[
            { type: "search", name: "q", placeholder: "Search by title, topic, or content…" },
            {
              type: "select",
              name: "tag",
              label: "Tag",
              options: tags.map((t) => ({ value: t.slug, label: t.name })),
            },
            {
              type: "select",
              name: "sort",
              label: "Sort",
              options: [
                { value: "latest", label: "Latest" },
                { value: "views", label: "Most viewed" },
                { value: "likes", label: "Most liked" },
                { value: "oldest", label: "Oldest first" },
              ],
            },
          ]}
        />
      </div>

      <div className="grid lg:grid-cols-4 gap-10 mt-10">
        <aside className="lg:col-span-1 space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="flex flex-col gap-1">
              <FilterPill
                href="/blog"
                label="All"
                count={totalPublishedPosts}
                active={!q && !tag}
              />
              {categories.map((c) => (
                <FilterPill
                  key={c._id}
                  href={`/category/${c.slug}`}
                  label={c.name}
                  count={c.postCount}
                />
              ))}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold mb-4">Popular tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Link
                    key={t._id}
                    href={`/blog?tag=${t.slug}`}
                    className={`chip hover:text-foreground ${tag === t.slug ? "chip-accent" : ""}`}
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="lg:col-span-3">
          {sorted.length === 0 ? (
            <div className="card p-12 text-center text-foreground-subtle">
              No posts match your filters.
              {(q || tag) && (
                <p className="mt-3">
                  <Link href="/blog" className="text-foreground underline underline-offset-2">
                    Clear all filters
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {sorted.map((p) => (
                <ArticleCard key={p._id} post={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function sortPosts(posts: ApiPost[], sort: string): ApiPost[] {
  const arr = [...posts];
  switch (sort) {
    case "views":
      return arr.sort((a, b) => b.views - a.views);
    case "likes":
      return arr.sort((a, b) => b.likes - a.likes);
    case "oldest":
      return arr.sort(
        (a, b) =>
          +new Date(a.publishedAt ?? a.createdAt) -
          +new Date(b.publishedAt ?? b.createdAt),
      );
    default:
      return arr.sort(
        (a, b) =>
          +new Date(b.publishedAt ?? b.createdAt) -
          +new Date(a.publishedAt ?? a.createdAt),
      );
  }
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
