import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleCard from "@/components/site/ArticleCard";
import { ArrowLeft, ArrowRight, Filter } from "@/components/Icon";
import { categories, getCategoryBySlug, getPostsByCategory, posts } from "@/lib/data";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  props: PageProps<"/category/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const c = getCategoryBySlug(slug);
  return {
    title: c ? c.name : "Category",
    description: c?.description ?? "Browse posts by category",
  };
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryPosts = getPostsByCategory(slug);
  const fallback = posts.slice(0, 4);
  const display = categoryPosts.length > 0 ? categoryPosts : fallback;

  return (
    <div className="pb-20">
      {/* Banner */}
      <section className={`relative overflow-hidden`}>
        <div
          className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-25`}
        />
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
            {category.name}
          </h1>
          <p className="mt-4 text-foreground-muted text-lg max-w-2xl">
            {category.description}
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-foreground-subtle">
            <span className="chip">{category.postCount} articles</span>
            <span className="chip">Updated weekly</span>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.slice(0, 8).map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className={`chip whitespace-nowrap ${
                c.slug === category.slug ? "chip-accent" : ""
              }`}
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

      {/* Posts */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {display.map((p) => (
            <ArticleCard key={p.slug} post={p} />
          ))}
        </div>

        <nav className="mt-12 flex items-center justify-center gap-2">
          <button className="btn-ghost text-sm" disabled>
            <ArrowLeft size={14} /> Previous
          </button>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className={`w-10 h-10 rounded-lg text-sm ${
                n === 1
                  ? "bg-gradient-accent text-white font-semibold"
                  : "text-foreground-muted hover:bg-white/5"
              }`}
            >
              {n}
            </button>
          ))}
          <button className="btn-ghost text-sm">
            Next <ArrowRight size={14} />
          </button>
        </nav>
      </div>
    </div>
  );
}
