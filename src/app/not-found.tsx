import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Search } from "@/components/Icon";
import { apiPublicSafe } from "@/lib/apiServer";
import type { ApiCategory } from "@/lib/models";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: `The page you were looking for doesn't exist on ${SITE_NAME}.`,
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const categories = await apiPublicSafe<ApiCategory[]>("/categories", []);
  const popular = [...categories]
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 6);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl w-full text-center">
        <p className="text-8xl font-bold tracking-tight text-gradient-accent">404</p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-foreground-muted">
          We couldn't find what you were looking for. It may have been moved, renamed,
          or never existed.
        </p>

        <form
          action="/blog"
          method="GET"
          className="mt-8 flex items-center gap-2 px-4 py-3 rounded-xl bg-background-elev border border-white/10 max-w-md mx-auto"
        >
          <Search size={18} />
          <input
            name="q"
            type="search"
            placeholder="Search articles…"
            className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full text-sm"
          />
          <button type="submit" className="btn-primary text-sm px-4">
            Search
          </button>
        </form>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to home <ArrowRight size={16} />
          </Link>
          <Link href="/blog" className="btn-ghost">
            All articles
          </Link>
        </div>

        {popular.length > 0 && (
          <div className="mt-14">
            <p className="text-xs uppercase tracking-wider text-foreground-subtle">
              Popular categories
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {popular.map((c) => (
                <Link
                  key={c._id}
                  href={`/category/${c.slug}`}
                  className="chip hover:text-foreground"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
