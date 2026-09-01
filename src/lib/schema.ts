import { SITE_AUTHOR, SITE_NAME, SITE_SOCIAL, SITE_URL, absoluteUrl } from "./site";
import type { ApiCategory, ApiFaq, ApiPost } from "./models";

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
    url: absoluteUrl("/logo.png"),
  },
};

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
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
      "Independent reviews and comparisons of the best AI tools and software for writing, coding, images, video, business and productivity.",
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
  // Task 8d — surface schema gaps in dev so they get fixed before publish.
  if (process.env.NODE_ENV !== "production") {
    if (!post.publishedAt) console.warn(`[schema] ${post.slug} missing datePublished`);
    if (!post.targetLanguage) console.warn(`[schema] ${post.slug} missing inLanguage`);
  }
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover ? [post.cover] : undefined,
    datePublished: post.publishedAt,
    dateModified: (post as ApiPost & { updatedAt?: string }).updatedAt ?? post.publishedAt,
    // Public author: the legitimately-assigned writer, or the approved editorial
    // identity as a fallback — never the admin account that created the post.
    author: [
      {
        "@type": "Person",
        name: post.authorName || SITE_AUTHOR,
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
    // Free, ad-supported content — tell crawlers there's no paywall so the page
    // is eligible for rich results and AI-answer citation.
    isAccessibleForFree: true,
    // Name the primary topic as an entity so Google / AI assistants can map this
    // article to the thing it's actually about (helps AI Overview citation).
    about: post.primaryKeyword
      ? { "@type": "Thing", name: post.primaryKeyword }
      : undefined,
    inLanguage: post.targetLanguage || "en-US",
  };
}

/**
 * FAQPage rich-result schema. Only emit when there are real Q&A pairs — Google
 * penalises empty or fabricated FAQ markup. Answers are plain text.
 */
export function faqSchema(faqs: ApiFaq[]) {
  const valid = faqs.filter((f) => f.question?.trim() && f.answer?.trim());
  if (valid.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: valid.map((f) => ({
      "@type": "Question",
      name: f.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer.trim(),
      },
    })),
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
