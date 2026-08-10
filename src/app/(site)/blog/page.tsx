import Link from "next/link";
import type { Metadata } from "next";
import ArticleCard from "@/components/site/ArticleCard";
import FilterBar from "@/components/FilterBar";
import { ArrowLeft, ArrowRight } from "@/components/Icon";
import { apiPublicSafe } from "@/lib/apiServer";
import type { ApiCategory, ApiPost, ApiTag } from "@/lib/models";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

const PAGE_SIZE = 12;

// P4.14 — Regenerate every 5 minutes.
export const revalidate = 300;

export async function generateMetadata(
  props: PageProps<"/blog">,
): Promise<Metadata> {
  const sp = await props.searchParams;
  const page = Math.max(1, Number(first(sp.page) ?? 1));
  const q = first(sp.q);
  const tag = first(sp.tag);

  // Canonical mirrors the request's meaningful query params so page 2+ is a
  // real crawlable URL that points to itself (avoids "canonical to page 1"
  // pitfall).
  const canonicalParams = new URLSearchParams();
  if (page > 1) canonicalParams.set("page", String(page));
  if (q) canonicalParams.set("q", q);
  if (tag) canonicalParams.set("tag", tag);
  const canonicalPath = `/blog${canonicalParams.size ? `?${canonicalParams}` : ""}`;

  const title =
    q ? `Search: “${q}”` : tag ? `#${tag}` : page > 1 ? `All articles — page ${page}` : "All articles";
  const description =
    q || tag
      ? `Articles filtered by ${q ? `"${q}"` : `#${tag}`} on ${SITE_NAME}.`
      : `Browse every article on ${SITE_NAME}. Filter by category, tag, or topic.`;

  return {
    title,
    description,
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
  const page = Math.max(1, Number(first(sp.page) ?? 1));

  const params = new URLSearchParams({ limit: "1000" });
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);

  const [posts, categories, tags] = await Promise.all([
    apiPublicSafe<ApiPost[]>(`/posts?${params.toString()}`, []),
    apiPublicSafe<ApiCategory[]>("/categories", []),
    apiPublicSafe<ApiTag[]>("/tags", []),
  ]);

  const sorted = sortPosts(posts, sort);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const pageStart = (clampedPage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  // Build a URL for a given page, preserving current filters.
  function pageHref(target: number) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (tag) p.set("tag", tag);
    if (sort && sort !== "latest") p.set("sort", sort);
    if (target > 1) p.set("page", String(target));
    const qs = p.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  }

  const pageNumbers = buildPageNumbers(clampedPage, totalPages);

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
              <FilterPill href="/blog" label="All" active={!q && !tag} />
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
          {pageItems.length === 0 ? (
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
              {pageItems.map((p) => (
                <ArticleCard key={p._id} post={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-12 flex items-center justify-between gap-4 flex-wrap"
            >
              {clampedPage > 1 ? (
                <Link href={pageHref(clampedPage - 1)} className="btn-ghost text-sm">
                  <ArrowLeft size={14} /> Previous
                </Link>
              ) : (
                <span className="btn-ghost text-sm opacity-40 cursor-not-allowed">
                  <ArrowLeft size={14} /> Previous
                </span>
              )}

              <div className="flex items-center gap-1">
                {pageNumbers.map((n, i) =>
                  n === "…" ? (
                    <span
                      key={`gap-${i}`}
                      className="px-2 text-foreground-subtle text-sm"
                    >
                      …
                    </span>
                  ) : (
                    <Link
                      key={n}
                      href={pageHref(n)}
                      aria-current={n === clampedPage ? "page" : undefined}
                      className={`w-10 h-10 rounded-lg text-sm grid place-items-center transition ${
                        n === clampedPage
                          ? "bg-gradient-accent text-white font-semibold"
                          : "text-foreground-muted hover:bg-white/5"
                      }`}
                    >
                      {n}
                    </Link>
                  ),
                )}
              </div>

              {clampedPage < totalPages ? (
                <Link href={pageHref(clampedPage + 1)} className="btn-ghost text-sm">
                  Next <ArrowRight size={14} />
                </Link>
              ) : (
                <span className="btn-ghost text-sm opacity-40 cursor-not-allowed">
                  Next <ArrowRight size={14} />
                </span>
              )}
            </nav>
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

/** Windowed page-number list with ellipses (e.g. 1 … 4 5 6 … 12). */
function buildPageNumbers(current: number, total: number): (number | "…")[] {
  const nums: (number | "…")[] = [];
  const push = (n: number | "…") => {
    if (nums[nums.length - 1] !== n) nums.push(n);
  };
  const window = 1;
  push(1);
  if (current - window > 2) push("…");
  for (let n = Math.max(2, current - window); n <= Math.min(total - 1, current + window); n++) {
    push(n);
  }
  if (current + window < total - 1) push("…");
  if (total > 1) push(total);
  return nums;
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
