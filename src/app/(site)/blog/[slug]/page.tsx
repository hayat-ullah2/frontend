import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleCard from "@/components/site/ArticleCard";
import CommentForm from "@/components/site/CommentForm";
import FaqBlock from "@/components/site/FaqBlock";
import JsonLd from "@/components/JsonLd";
import LeadMagnet from "@/components/site/LeadMagnet";
import Newsletter from "@/components/site/Newsletter";
import PostActions from "@/components/site/PostActions";
import ReadingProgress from "@/components/site/ReadingProgress";
import AdSlot from "@/components/site/monetize/AdSlot";
import AffiliateDisclosure from "@/components/site/monetize/AffiliateDisclosure";
import RecommendedTools from "@/components/site/monetize/RecommendedTools";
import ShareButton from "@/components/site/ShareButton";
import { Clock, Eye, Linkedin, Twitter } from "@/components/Icon";
import { apiPublic, apiPublicSafe } from "@/lib/apiServer";
import { ApiError } from "@/lib/api";
import type { ApiComment, ApiPost } from "@/lib/models";
import { blogPostingSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

// P4.14 — Regenerate an individual post every 5 minutes (also revalidated on
// demand via /api/revalidate when the admin edits/publishes).
// 60s fallback; the /api/revalidate webhook refreshes this instantly on publish.
export const revalidate = 60;

// P4.14 — Prebuild the 50 most recent posts at build time. Older posts are
// generated on-demand and then cached.
export async function generateStaticParams() {
  const posts = await apiPublicSafe<ApiPost[]>(
    "/posts?limit=50&status=published",
    [],
  );
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const post = await apiPublic<ApiPost>(`/posts/${slug}`);
    const url = absoluteUrl(`/blog/${slug}`);
    const cover = post.cover ? [post.cover] : [absoluteUrl(`/blog/${slug}/opengraph-image`)];
    return {
      title: post.title,
      description: post.excerpt,
      // Honor an explicit canonical (localized variants point back to the
      // original to avoid duplicate-content issues); otherwise self-canonical.
      alternates: { canonical: post.seo?.canonical || `/blog/${slug}` },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url,
        siteName: SITE_NAME,
        type: "article",
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt ?? post.publishedAt,
        authors: [post.author?.name].filter(Boolean) as string[],
        images: cover.map((c) => ({ url: c, width: 1200, height: 630, alt: post.title })),
        tags: post.tags?.map((t) => t.name),
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: cover,
      },
    };
  } catch {
    return { title: "Article not found" };
  }
}

export default async function SinglePostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  let post: ApiPost;
  try {
    post = await apiPublic<ApiPost>(`/posts/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [related, comments] = await Promise.all([
    apiPublicSafe<ApiPost[]>(`/posts?category=${post.category._id}&limit=4`, []),
    apiPublicSafe<ApiComment[]>(`/posts/${slug}/comments`, []),
  ]);
  const relatedFiltered = related.filter((p) => p._id !== post._id).slice(0, 3);

  // P4.16 — Show "Updated on" only when the edit is > 24h after publish.
  const publishedTs = post.publishedAt ? +new Date(post.publishedAt) : 0;
  const updatedTs = post.updatedAt ? +new Date(post.updatedAt) : 0;
  const wasUpdatedLater =
    !!publishedTs && !!updatedTs && updatedTs - publishedTs > 24 * 60 * 60 * 1000;

  return (
    <>
      <ReadingProgress />
      <JsonLd
        data={[
          blogPostingSchema(post),
          breadcrumbSchema([
            { name: "Home", item: absoluteUrl("/") },
            { name: "Blog", item: absoluteUrl("/blog") },
            {
              name: post.category.name,
              item: absoluteUrl(`/category/${post.category.slug}`),
            },
            { name: post.title },
          ]),
          ...(post.faqs && post.faqs.length ? [faqSchema(post.faqs)] : []),
        ].filter(Boolean)}
      />

      <article className="pb-20">
        <header>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
            <nav className="flex items-center gap-2 text-xs text-foreground-subtle">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-foreground">Blog</Link>
              <span>/</span>
              <Link href={`/category/${post.category.slug}`} className="hover:text-foreground">
                {post.category.name}
              </Link>
            </nav>

            <Link href={`/category/${post.category.slug}`} className="chip-accent inline-flex mt-5">
              {post.category.name}
            </Link>
            <h1 className="mt-4 text-[1.9rem] sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.12]">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-4 text-lg sm:text-xl text-foreground-muted leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Byline bar */}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-white/10 py-4 text-sm">
              <Link
                href={`/author/${post.author._id}`}
                className="flex items-center gap-2 group"
              >
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={28}
                    height={28}
                    className="rounded-full object-cover h-7 w-7"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-gradient-accent grid place-items-center text-white text-[10px] font-bold">
                    {post.author.name.charAt(0)}
                  </span>
                )}
                <span className="text-foreground-muted">
                  By{" "}
                  <span className="text-foreground font-medium group-hover:underline">
                    {post.author.name}
                  </span>
                </span>
              </Link>
              {post.publishedAt && (
                <span className="text-foreground-subtle">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              {wasUpdatedLater && post.updatedAt && (
                <span className="text-foreground-subtle italic">
                  Updated{" "}
                  {new Date(post.updatedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              <span className="flex items-center gap-1 text-foreground-subtle">
                <Clock size={14} /> {post.readingTime} min read
              </span>
              <span className="flex items-center gap-1 text-foreground-subtle">
                <Eye size={14} /> {formatNum(post.views)} views
              </span>
            </div>
          </div>

          {/* Hero image — full-bleed on mobile, contained on larger screens. */}
          {post.cover && (
            <figure className="mt-6 sm:mt-8">
              <div className="sm:mx-auto sm:max-w-4xl sm:px-6 lg:px-8">
                <div className="relative aspect-[16/9] overflow-hidden border-y border-white/5 sm:rounded-2xl sm:border">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, 896px"
                    className="object-cover"
                  />
                </div>
              </div>
            </figure>
          )}
        </header>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14">
          <div className="grid lg:grid-cols-12 gap-10 min-w-0">
            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-24 flex flex-col items-center gap-5">
                <PostActions
                  slug={slug}
                  initialLikes={post.likes}
                  initialCommentCount={post.commentCount}
                />
                <div className="w-px h-6 bg-white/10 my-1" />
                <ShareButton />
              </div>
            </aside>

            <div className="lg:col-span-8 min-w-0">
              {post.content &&
                (() => {
                  // Task 12a — auto-insert the affiliate disclosure just above
                  // the first H2 on any post that links out through /go/.
                  const html = post.content;
                  const h2 = html.search(/<h2\b/i);
                  if (html.includes("/go/") && h2 > -1) {
                    return (
                      <>
                        <div className="prose-article" dangerouslySetInnerHTML={{ __html: html.slice(0, h2) }} />
                        <AffiliateDisclosure className="my-6" compact />
                        <div className="prose-article" dangerouslySetInnerHTML={{ __html: html.slice(h2) }} />
                      </>
                    );
                  }
                  return <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />;
                })()}

              {post.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-foreground-subtle mr-1">Tags:</span>
                  {post.tags.map((t) => (
                    <Link key={t._id} href={`/blog?tag=${t.slug}`} className="chip">
                      #{t.name}
                    </Link>
                  ))}
                </div>
              )}

              <AdSlot className="my-10" />

              <RecommendedTools links={post.affiliateLinks} postSlug={slug} />

              <FaqBlock faqs={post.faqs} />

              <section id="comments" className="mt-12">
                <h3 className="text-2xl font-bold">
                  Comments{" "}
                  <span className="text-foreground-subtle text-base">({comments.length})</span>
                </h3>

                <CommentForm slug={slug} />

                <div className="mt-6 space-y-5">
                  {comments.length === 0 ? (
                    <p className="text-sm text-foreground-subtle text-center py-8">
                      Be the first to comment.
                    </p>
                  ) : (
                    comments.map((c) => (
                      <div key={c._id} className="flex gap-3">
                        {c.author.avatar ? (
                          <Image src={c.author.avatar} alt={c.author.name} width={40} height={40} className="rounded-full object-cover h-10 w-10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-accent grid place-items-center text-white text-xs font-bold">
                            {c.author.name[0]}
                          </div>
                        )}
                        <div className="flex-1 card p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">{c.author.name}</p>
                            <p className="text-xs text-foreground-subtle">
                              {new Date(c.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <p className="mt-2 text-sm text-foreground-muted">{c.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <aside className="lg:col-span-3 min-w-0">
              <div className="sticky top-24 space-y-6">
                <LeadMagnet
                  slug="ai-tools-starter-kit"
                  title="Free: The AI Tools Starter Kit"
                  description="A no-hype checklist for picking AI & dev tools worth paying for."
                  resourceHref="/resources/ai-tools-starter-kit"
                  buttonLabel="Get it free"
                  compact
                />
                <div className="card p-5">
                  <h4 className="font-semibold mb-3 text-sm">Share this article</h4>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-ghost text-xs p-2" type="button" title="Twitter (not yet wired)">
                      <Twitter size={14} />
                    </button>
                    <button className="btn-ghost text-xs p-2" type="button" title="LinkedIn (not yet wired)">
                      <Linkedin size={14} />
                    </button>
                    <ShareButton className="btn-ghost text-xs p-2" title={post.title} />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {relatedFiltered.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
            <h2 className="text-3xl font-bold tracking-tight">Related articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {relatedFiltered.map((p) => (
                <ArticleCard key={p._id} post={p} />
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <Newsletter />
        </section>
      </article>
    </>
  );
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
