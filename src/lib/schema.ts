import { SITE_AUTHOR, SITE_NAME, SITE_SOCIAL, SITE_URL, absoluteUrl } from "./site";
import type { ApiCategory, ApiPost } from "./models";

/**
 * Central factory for schema.org JSON-LD payloads. Only include fields that
 * have real values — omitting is better than emitting empty strings, which
 * Google Rich Results Test flags as errors.
 */

const publisher = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl("/favicon.ico"),
  },
};

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/favicon.ico"),
    sameAs: [
      SITE_SOCIAL.twitter,
      SITE_SOCIAL.github,
      SITE_SOCIAL.linkedin,
    ].filter(Boolean),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Modern, multi-niche publication covering technology, AI, business, finance, and more.",
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function blogPostingSchema(post: ApiPost) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const authorUrl = absoluteUrl(`/author/${post.author._id}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover ? [post.cover] : undefined,
    datePublished: post.publishedAt,
    dateModified: (post as ApiPost & { updatedAt?: string }).updatedAt ?? post.publishedAt,
    author: [
      {
        "@type": "Person",
        name: post.author?.name ?? SITE_AUTHOR,
        url: authorUrl,
      },
    ],
    publisher,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    articleSection: post.category?.name,
    keywords: [post.primaryKeyword, ...(post.tags?.map((t) => t.name) ?? [])]
      .filter(Boolean)
      .join(", ") || undefined,
    inLanguage: post.targetLanguage || undefined,
  };
}

export function breadcrumbSchema(
  items: { name: string; item?: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.item ? { item: it.item } : {}),
    })),
  };
}

export function collectionPageSchema(
  category: ApiCategory,
  posts: ApiPost[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: absoluteUrl(`/category/${category.slug}`),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    hasPart: posts.slice(0, 20).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: absoluteUrl(`/blog/${p.slug}`),
      image: p.cover ? [p.cover] : undefined,
      datePublished: p.publishedAt,
    })),
  };
}
