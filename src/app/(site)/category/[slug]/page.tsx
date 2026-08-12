import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleCard from "@/components/site/ArticleCard";
import JsonLd from "@/components/JsonLd";
import { ArrowLeft, ArrowRight, Filter } from "@/components/Icon";
import { apiPublic, apiPublicSafe } from "@/lib/apiServer";
import { ApiError } from "@/lib/api";
import type { ApiCategory, ApiPost } from "@/lib/models";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

const PAGE_SIZE = 12;

// P4.14 — Regenerate category pages every 5 minutes.
export const revalidate = 300;

export async function generateMetadata(
  props: PageProps<"/category/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const page = Math.max(1, Number(first(sp.page) ?? 1));

  try {
    const cat = await apiPublic<ApiCategory>(`/categories/${slug}`);
    const canonicalPath =
      page > 1 ? `/category/${slug}?page=${page}` : `/category/${slug}`;
    const title =
      page > 1 ? `${cat.name} — page ${page}` : cat.name;
    const description =
      cat.description ??
      `Articles in the ${cat.name} category on ${SITE_NAME}.`;
    return {
      title,
      description,
      alternates: { canonical: canonicalPath },
      // Keep empty category pages out of the index (thin content) but let
      // crawlers follow links out of them.
      robots: (cat.postCount ?? 0) === 0 ? { index: false, follow: true } : undefined,
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
            alt: cat.name,
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
  } catch {
    return { title: "Category" };
  }
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const page = Math.max(1, Number(first(sp.page) ?? 1));

  let category: ApiCategory;
  try {
    category = await apiPublic<ApiCategory>(`/categories/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [posts, allCategories] = await Promise.all([
    apiPublicSafe<ApiPost[]>(`/posts?category=${category._id}&limit=1000`, []),
    apiPublicSafe<ApiCategory[]>("/categories", []),
  ]);

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const pageStart = (clampedPage - 1) * PAGE_SIZE;
  const pageItems = posts.slice(pageStart, pageStart + PAGE_SIZE);

  function pageHref(target: number) {
    return target > 1
      ? `/category/${slug}?page=${target}`
      : `/category/${slug}`;
  }

  return (
    <div className="pb-20">
      <JsonLd
        data={[
          collectionPageSchema(category, posts),
          breadcrumbSchema([
            { name: "Home", item: absoluteUrl("/") },
            { name: "Blog", item: absoluteUrl("/blog") },
            { name: category.name },
          ]),
        ]}
      />
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-25`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <nav className="flex items-center gap-2 text-xs text-foreground-subtle">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span className="text-foreground">{category.name}</span>
          </nav>
          <h1 className="mt-6 text-5xl sm:text-6xl font-bold tracking-tight">
            <span className="text-gradient-accent">{category.name}</span>
          </h1>
          <p className="mt-4 text-foreground-muted text-lg max-w-2xl">
            {category.description}
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-foreground-subtle">
            <span className="chip">{posts.length} articles</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {allCategories.slice(0, 8).map((c) => (
            <Link
              key={c._id}
              href={`/category/${c.slug}`}
              className={`chip whitespace-nowrap ${c._id === category._id ? "chip-accent" : ""}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
        <div className="relative">
          <select className="appearance-none bg-background-elev border border-white/5 rounded-xl px-4 py-2 text-sm pr-10 outline-none">
            <option>Latest</option>
            <option>Most viewed</option>
            <option>Most liked</option>
          </select>
          <Filter
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle"
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {pageItems.length === 0 ? (
          <div className="card p-12 text-center text-foreground-subtle">
            No posts in this category yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map((p) => (
              <ArticleCard key={p._id} post={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-12 flex items-center justify-center gap-2 flex-wrap"
          >
            {clampedPage > 1 && (
              <Link href={pageHref(clampedPage - 1)} className="btn-ghost text-sm">
                <ArrowLeft size={14} /> Previous
              </Link>
            )}
            <span className="text-xs text-foreground-subtle px-4">
              Page {clampedPage} of {totalPages}
            </span>
            {clampedPage < totalPages && (
              <Link href={pageHref(clampedPage + 1)} className="btn-ghost text-sm">
                Next <ArrowRight size={14} />
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
