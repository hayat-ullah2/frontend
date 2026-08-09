import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ArticleCard from "@/components/site/ArticleCard";
import JsonLd from "@/components/JsonLd";
import Newsletter from "@/components/site/Newsletter";
import {
  ArrowRight,
  Clock,
  Eye,
  Sparkles,
  TrendUp,
  Users,
} from "@/components/Icon";
import { apiServerSafe } from "@/lib/apiServer";
import type { ApiCategory, ApiPost, ApiTag } from "@/lib/models";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// P4.14 — Regenerate the home page every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: `${SITE_NAME} — Long-form essays on tech, AI & business`,
  description:
    "Curated long-form journalism on technology, artificial intelligence, programming, business, finance, health, and the ideas shaping the next decade.",
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} — Long-form essays on tech, AI & business`,
    description:
      "Curated long-form journalism on technology, AI, business and the ideas shaping the next decade.",
    url: SITE_URL,
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
    title: SITE_NAME,
    description:
      "Curated long-form journalism on technology, AI, business and the ideas shaping the next decade.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

export default async function HomePage() {
  const [posts, categories, tags] = await Promise.all([
    apiServerSafe<ApiPost[]>("/posts?limit=20", []),
    apiServerSafe<ApiCategory[]>("/categories", []),
    apiServerSafe<ApiTag[]>("/tags", []),
  ]);

  // Featured authors = unique authors of recently published posts.
  // Derived from posts so we never expose admin accounts as "authors" unless
  // they've actually published something publicly. Names only — no roles/emails.
  const seenAuthors = new Set<string>();
  const authors: { _id: string; name: string; avatar?: string }[] = [];
  for (const p of posts) {
    if (!p.author?._id) continue;
    if (seenAuthors.has(p.author._id)) continue;
    seenAuthors.add(p.author._id);
    authors.push({
      _id: p.author._id,
      name: p.author.name,
      avatar: p.author.avatar,
    });
    if (authors.length >= 4) break;
  }

  const featured = posts.find((p) => p.featured) ?? posts[0];
  const trending = posts.filter((p) => p.trending).slice(0, 4);
  const latest = posts.slice(0, 9);
  const popularCategories = categories.slice(0, 8);
  const popularTags = tags.slice(0, 12);

  // Empty-state if there's literally nothing.
  if (!featured) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-32 text-center">
        <span className="chip">
          <Sparkles size={12} /> Empty workspace
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight">No posts yet</h1>
        <p className="mt-3 text-foreground-muted">
          The backend has no published posts. Log in as admin and run the content seed,
          or create a post in the admin panel.
        </p>
        <Link href="/admin/blogs/new" className="btn-primary mt-6 inline-flex">
          Create the first post <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-24 pb-20">
      <JsonLd data={[websiteSchema(), organizationSchema()]} />
      {/* HERO */}
      <section className="relative">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 20% 0%, rgba(139,92,246,0.18) 0%, transparent 60%), radial-gradient(50% 50% at 80% 10%, rgba(59,130,246,0.18) 0%, transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 animate-fade-in-up">
              <span className="chip">
                <Sparkles size={12} /> Editor's pick
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                Where curious minds <br />
                <span className="text-gradient-accent">read deeper.</span>
              </h1>
              <p className="mt-5 text-foreground-muted text-lg max-w-lg">
                Long-form essays on technology, AI, business, finance and the ideas
                shaping the next decade — written by people who do the work.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href={`/blog/${featured.slug}`} className="btn-primary">
                  Read the featured story <ArrowRight size={16} />
                </Link>
                <Link href="/blog" className="btn-ghost">
                  Browse all articles
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                <Stat label="Articles" value={posts.length.toString()} />
                <Stat label="Categories" value={categories.length.toString()} />
                <Stat label="Writers" value={authors.length.toString()} />
              </div>
            </div>

            <div className="lg:col-span-7">
              <Link
                href={`/blog/${featured.slug}`}
                className="group relative block rounded-3xl overflow-hidden border border-white/5"
              >
                <div className="relative aspect-[16/10]">
                  {featured.cover && (
                    <Image
                      src={featured.cover}
                      alt={featured.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  {featured.category && (
                    <span className="chip-accent">{featured.category.name}</span>
                  )}
                  <span className="chip">Featured</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight max-w-2xl leading-tight">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-foreground-muted max-w-xl line-clamp-2">
                    {featured.excerpt}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-5 text-sm">
                    <span>{featured.author?.name}</span>
                    <span className="flex items-center gap-1 text-foreground-subtle">
                      <Clock size={14} /> {featured.readingTime} min read
                    </span>
                    <span className="flex items-center gap-1 text-foreground-subtle">
                      <Eye size={14} /> {formatNum(featured.views)} views
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      {trending.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={<TrendUp size={16} />}
            eyebrow="What's hot"
            title="Trending this week"
            link={{ href: "/blog?sort=trending", label: "See all" }}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {trending.map((p, i) => (
              <div key={p._id} className="relative">
                <span className="absolute -top-3 -left-3 z-10 w-10 h-10 rounded-full bg-gradient-accent text-white text-sm font-bold grid place-items-center shadow-lg">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ArticleCard post={p} variant="compact" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LATEST + SIDEBAR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={<Sparkles size={16} />}
          eyebrow="Fresh ink"
          title="Latest posts"
          link={{ href: "/blog", label: "View all" }}
        />
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
            {latest.slice(0, 6).map((p) => (
              <ArticleCard key={p._id} post={p} />
            ))}
          </div>
          <aside className="space-y-6">
            <div className="card p-5">
              <h3 className="font-semibold mb-4">Most read</h3>
              <div className="space-y-4">
                {[...latest].sort((a, b) => b.views - a.views).slice(0, 4).map((p) => (
                  <ArticleCard key={p._id} post={p} variant="horizontal" />
                ))}
              </div>
            </div>
            {popularTags.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold mb-4">Popular tags</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((t) => (
                    <Link key={t._id} href={`/blog?tag=${t.slug}`} className="chip hover:text-foreground">
                      #{t.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* CATEGORIES */}
      {popularCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={<Sparkles size={16} />}
            eyebrow="Find your niche"
            title="Popular categories"
            link={{ href: "/blog", label: "Browse all" }}
          />
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {popularCategories.map((c) => (
              <Link
                key={c._id}
                href={`/category/${c.slug}`}
                className="card p-5 group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-15 transition`} />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} grid place-items-center text-white text-sm font-bold`}>
                    {c.name.charAt(0)}
                  </div>
                  <h3 className="mt-4 font-semibold">{c.name}</h3>
                  <p className="mt-1 text-xs text-foreground-subtle line-clamp-2">
                    {c.description}
                  </p>
                  <p className="mt-3 text-xs text-foreground-subtle">
                    {c.postCount} articles
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AUTHORS */}
      {authors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={<Users size={16} />}
            eyebrow="People behind the words"
            title="Featured authors"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {authors.map((a) => (
              <div key={a._id} className="card p-6 text-center">
                {a.avatar ? (
                  <div className="relative mx-auto w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/5">
                    <Image src={a.avatar} alt={a.name} fill sizes="80px" className="object-cover" />
                  </div>
                ) : (
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-accent grid place-items-center text-white text-2xl font-bold">
                    {a.name[0]}
                  </div>
                )}
                <h3 className="mt-4 font-semibold">{a.name}</h3>
                <p className="text-xs text-foreground-subtle">Author</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Newsletter />
      </section>
    </div>
  );
}

function SectionHeader({
  icon,
  eyebrow,
  title,
  link,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <span className="chip">
          {icon}
          {eyebrow}
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
      </div>
      {link && (
        <Link href={link.href} className="text-sm text-foreground-muted hover:text-foreground inline-flex items-center gap-1">
          {link.label} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-foreground-subtle uppercase tracking-wider">{label}</p>
    </div>
  );
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
