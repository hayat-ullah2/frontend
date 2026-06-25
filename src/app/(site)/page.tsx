import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/site/ArticleCard";
import Newsletter from "@/components/site/Newsletter";
import {
  ArrowRight,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Sparkles,
  TrendUp,
  Users,
} from "@/components/Icon";
import {
  authors,
  categories,
  getFeaturedPost,
  getLatestPosts,
  getTrendingPosts,
  tags,
} from "@/lib/data";

export default function HomePage() {
  const featured = getFeaturedPost();
  const trending = getTrendingPosts(4);
  const latest = getLatestPosts(9);
  const featuredAuthor = authors.find((a) => a.slug === featured.authorSlug)!;
  const featuredCategory = categories.find((c) => c.slug === featured.category)!;
  const topAuthors = authors.slice(0, 4);
  const popularCategories = categories.slice(0, 8);
  const popularTags = tags.slice(0, 12);

  return (
    <div className="space-y-24 pb-20">
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
                  Read the featured story
                  <ArrowRight size={16} />
                </Link>
                <Link href="/blog" className="btn-ghost">
                  Browse all articles
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                {[
                  { label: "Articles", value: "1.2k+" },
                  { label: "Writers", value: "120+" },
                  { label: "Readers", value: "480k" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-semibold">{s.value}</p>
                    <p className="text-xs text-foreground-subtle uppercase tracking-wider">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <Link
                href={`/blog/${featured.slug}`}
                className="group relative block rounded-3xl overflow-hidden border border-white/5"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={featured.cover}
                    alt={featured.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <span className="chip-accent">{featuredCategory.name}</span>
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
                    <div className="flex items-center gap-2">
                      <Image
                        src={featuredAuthor.avatar}
                        width={32}
                        height={32}
                        alt={featuredAuthor.name}
                        className="rounded-full object-cover"
                      />
                      <span>{featuredAuthor.name}</span>
                    </div>
                    <span className="flex items-center gap-1 text-foreground-subtle">
                      <Clock size={14} /> {featured.readingTime} min read
                    </span>
                    <span className="flex items-center gap-1 text-foreground-subtle">
                      <Eye size={14} /> {(featured.views / 1000).toFixed(1)}k views
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={<TrendUp size={16} />}
          eyebrow="What's hot"
          title="Trending this week"
          link={{ href: "/blog?sort=trending", label: "See all" }}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {trending.map((p, i) => (
            <div key={p.slug} className="relative">
              <span className="absolute -top-3 -left-3 z-10 w-10 h-10 rounded-full bg-gradient-accent text-white text-sm font-bold grid place-items-center shadow-lg">
                {String(i + 1).padStart(2, "0")}
              </span>
              <ArticleCard post={p} variant="compact" />
            </div>
          ))}
        </div>
      </section>

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
              <ArticleCard key={p.slug} post={p} />
            ))}
          </div>

          <aside className="space-y-6">
            <div className="card p-5">
              <h3 className="font-semibold mb-4">Most read</h3>
              <div className="space-y-4">
                {latest.slice(0, 4).map((p) => (
                  <ArticleCard key={p.slug} post={p} variant="horizontal" />
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold mb-4">Popular tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((t) => (
                  <Link key={t.slug} href={`/blog?tag=${t.slug}`} className="chip hover:text-foreground">
                    #{t.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* CATEGORIES */}
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
              key={c.slug}
              href={`/category/${c.slug}`}
              className="card p-5 group relative overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-15 transition`}
              />
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} grid place-items-center text-white text-sm font-bold`}
                >
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

      {/* AUTHORS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={<Users size={16} />}
          eyebrow="People behind the words"
          title="Featured authors"
          link={{ href: "/author/alex-rivera", label: "Meet the team" }}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {topAuthors.map((a) => (
            <Link
              key={a.slug}
              href={`/author/${a.slug}`}
              className="card p-6 text-center group"
            >
              <div className="relative mx-auto w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/5 group-hover:ring-violet-500/40 transition">
                <Image src={a.avatar} alt={a.name} fill sizes="80px" className="object-cover" />
              </div>
              <h3 className="mt-4 font-semibold">{a.name}</h3>
              <p className="text-xs text-foreground-subtle">{a.role}</p>
              <p className="mt-3 text-xs text-foreground-muted line-clamp-2">{a.bio}</p>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-foreground-subtle">
                <span>{a.postsCount} posts</span>
                <span>{(a.followers / 1000).toFixed(1)}k followers</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
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
        <Link
          href={link.href}
          className="text-sm text-foreground-muted hover:text-foreground inline-flex items-center gap-1"
        >
          {link.label} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
