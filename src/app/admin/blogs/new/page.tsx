import PostForm, { type LinkablePost } from "@/components/admin/PostForm";
import { apiServerSafe } from "@/lib/apiServer";
import type { ApiAffiliateLink, ApiCategory, ApiPost, ApiTag } from "@/lib/models";

export default async function NewBlogPostPage() {
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
      publishedPosts={publishedPosts}
      affiliateOptions={affiliateOptions}
    />
  );
}
