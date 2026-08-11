import { notFound } from "next/navigation";
import PostForm, { type LinkablePost } from "@/components/admin/PostForm";
import { ApiError } from "@/lib/api";
import { apiServer, apiServerSafe } from "@/lib/apiServer";
import type { ApiAffiliateLink, ApiCategory, ApiPost, ApiTag } from "@/lib/models";

export default async function EditPostPage(props: PageProps<"/admin/blogs/[slug]/edit">) {
  const { slug } = await props.params;

  let post: ApiPost;
  try {
    post = await apiServer<ApiPost>(`/posts/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [categories, tags, published, affiliateOptions] = await Promise.all([
    apiServerSafe<ApiCategory[]>("/categories", []),
    apiServerSafe<ApiTag[]>("/tags", []),
    apiServerSafe<ApiPost[]>("/posts?status=published&limit=100", []),
    apiServerSafe<ApiAffiliateLink[]>("/affiliate-links?all=1", []),
  ]);

  const publishedPosts: LinkablePost[] = published.map((p) => ({
    title: p.title,
    slug: p.slug,
    categorySlug: p.category?.slug,
    tagSlugs: p.tags?.map((t) => t.slug),
  }));

  return (
    <PostForm
      categories={categories}
      tags={tags}
      initial={post}
      publishedPosts={publishedPosts}
      affiliateOptions={affiliateOptions}
    />
  );
}
