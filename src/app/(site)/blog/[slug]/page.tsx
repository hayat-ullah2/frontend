import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleCard from "@/components/site/ArticleCard";
import Newsletter from "@/components/site/Newsletter";
import ReadingProgress from "@/components/site/ReadingProgress";
import {
  Bookmark,
  Clock,
  Eye,
  Github,
  Heart,
  Linkedin,
  MessageSquare,
  Share,
  Twitter,
} from "@/components/Icon";
import {
  authors,
  categories,
  getAuthorBySlug,
  getCommentsForPost,
  getPostBySlug,
  getRelatedPosts,
  posts,
  samplePostBody,
} from "@/lib/data";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.cover],
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

const toc = [
  { id: "introduction", label: "Introduction" },
  { id: "the-shape-of-the-problem", label: "The shape of the problem" },
  { id: "three-patterns-that-hold-up", label: "Three patterns that hold up" },
  { id: "what-to-watch-next", label: "What to watch next" },
  { id: "closing-thoughts", label: "Closing thoughts" },
];

export default async function SinglePostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const author = getAuthorBySlug(post.authorSlug)!;
  const category = categories.find((c) => c.slug === post.category)!;
  const related = getRelatedPosts(post, 3);
  const postComments = getCommentsForPost(post.slug);

  return (
    <>
      <ReadingProgress />

      <article className="pb-20">
        {/* Header */}
        <header className="relative">
          <div className="absolute inset-0 -z-10">
            <Image
              src={post.cover}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
          </div>

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
            <Breadcrumbs
              items={[
                { href: "/", label: "Home" },
                { href: "/blog", label: "Blog" },
                { href: `/category/${category.slug}`, label: category.name },
              ]}
            />
            <Link
              href={`/category/${category.slug}`}
              className="chip-accent inline-flex mt-6"
            >
              {category.name}
            </Link>
            <h1 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="mt-4 text-foreground-muted text-lg max-w-2xl mx-auto">
              {post.excerpt}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm">
              <Link
                href={`/author/${author.slug}`}
                className="flex items-center gap-2 hover:text-gradient-accent"
              >
                <Image
                  src={author.avatar}
                  alt={author.name}
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
                <span>{author.name}</span>
              </Link>
              <span className="text-foreground-subtle">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1 text-foreground-subtle">
                <Clock size={14} /> {post.readingTime} min read
              </span>
              <span className="flex items-center gap-1 text-foreground-subtle">
                <Eye size={14} /> {(post.views / 1000).toFixed(1)}k views
              </span>
            </div>
          </div>

          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-[16/8] rounded-3xl overflow-hidden border border-white/5">
              <Image src={post.cover} alt={post.title} fill priority sizes="100vw" className="object-cover" />
            </div>
          </div>
        </header>

        {/* Body + TOC + Share */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Share rail */}
            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-24 flex flex-col items-center gap-3">
                <ShareButton icon={<Heart size={16} />} label={String(post.likes)} />
                <ShareButton icon={<MessageSquare size={16} />} label={String(post.comments)} />
                <ShareButton icon={<Bookmark size={16} />} />
                <div className="w-px h-6 bg-white/10 my-1" />
                <ShareButton icon={<Twitter size={16} />} />
                <ShareButton icon={<Linkedin size={16} />} />
                <ShareButton icon={<Share size={16} />} />
              </div>
            </aside>

            {/* Article body */}
            <div className="lg:col-span-8">
              <div
                className="prose-article"
                dangerouslySetInnerHTML={{ __html: samplePostBody }}
              />

              {/* Tags */}
              <div className="mt-10 flex flex-wrap items-center gap-2">
                <span className="text-sm text-foreground-subtle mr-1">Tags:</span>
                {post.tags.length === 0 && (
                  <span className="chip">#{category.slug}</span>
                )}
                {post.tags.map((t) => (
                  <Link key={t} href={`/blog?tag=${t}`} className="chip">
                    #{t}
                  </Link>
                ))}
              </div>

              {/* Author block */}
              <div className="card mt-10 p-6 flex flex-col sm:flex-row gap-5 items-start">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  width={80}
                  height={80}
                  className="rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-xs text-foreground-subtle uppercase tracking-wider">
                    Written by
                  </p>
                  <h3 className="text-xl font-semibold">{author.name}</h3>
                  <p className="text-sm text-foreground-muted mt-2">{author.bio}</p>
                  <div className="mt-4 flex items-center gap-2">
                    {author.twitter && (
                      <a className="btn-ghost p-2" href="#" aria-label="Twitter">
                        <Twitter size={14} />
                      </a>
                    )}
                    {author.github && (
                      <a className="btn-ghost p-2" href="#" aria-label="GitHub">
                        <Github size={14} />
                      </a>
                    )}
                    {author.linkedin && (
                      <a className="btn-ghost p-2" href="#" aria-label="LinkedIn">
                        <Linkedin size={14} />
                      </a>
                    )}
                    <Link href={`/author/${author.slug}`} className="ml-auto text-sm text-foreground-muted hover:text-foreground">
                      Full profile →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <section id="comments" className="mt-12">
                <h3 className="text-2xl font-bold">
                  Comments <span className="text-foreground-subtle text-base">({postComments.length})</span>
                </h3>

                <div className="card mt-5 p-5">
                  <textarea
                    rows={4}
                    placeholder="Add to the conversation…"
                    className="w-full bg-transparent border-0 outline-none resize-none placeholder:text-foreground-subtle"
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-foreground-subtle">
                      Be respectful. Markdown supported.
                    </p>
                    <button className="btn-primary text-sm">Post comment</button>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  {postComments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <Image
                        src={c.avatar}
                        alt={c.author}
                        width={40}
                        height={40}
                        className="rounded-full object-cover h-10 w-10"
                      />
                      <div className="flex-1 card p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{c.author}</p>
                          <p className="text-xs text-foreground-subtle">
                            {new Date(c.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-foreground-muted">{c.content}</p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-foreground-subtle">
                          <button className="flex items-center gap-1 hover:text-foreground">
                            <Heart size={12} /> {c.likes}
                          </button>
                          <button className="hover:text-foreground">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* TOC sidebar */}
            <aside className="lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                <div className="card p-5">
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-foreground-subtle">
                    Table of contents
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {toc.map((t) => (
                      <li key={t.id}>
                        <a
                          href={`#${t.id}`}
                          className="text-foreground-muted hover:text-foreground block py-1 border-l-2 border-transparent hover:border-violet-500 pl-3 -ml-3 transition"
                        >
                          {t.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card p-5">
                  <h4 className="font-semibold mb-3 text-sm">Share this article</h4>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-ghost text-xs p-2">
                      <Twitter size={14} />
                    </button>
                    <button className="btn-ghost text-xs p-2">
                      <Linkedin size={14} />
                    </button>
                    <button className="btn-ghost text-xs p-2">
                      <Share size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Related */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <h2 className="text-3xl font-bold tracking-tight">Related articles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {related.map((p) => (
              <ArticleCard key={p.slug} post={p} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <Newsletter />
        </section>
      </article>
    </>
  );
}

function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="flex items-center justify-center gap-2 text-xs text-foreground-subtle">
      {items.map((it, i) => (
        <span key={it.href + i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          <Link href={it.href} className="hover:text-foreground">
            {it.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

function ShareButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label?: string;
}) {
  return (
    <button className="w-10 h-10 rounded-full border border-white/10 bg-background-elev flex items-center justify-center text-foreground-muted hover:text-foreground hover:border-violet-500/40 transition relative">
      {icon}
      {label && (
        <span className="absolute -bottom-4 text-[10px] text-foreground-subtle">
          {label}
        </span>
      )}
    </button>
  );
}
