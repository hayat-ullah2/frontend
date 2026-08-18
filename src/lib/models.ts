// Shared API response types — what the backend actually returns.

export type ApiUser = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "writer" | "reader";
  status: "active" | "pending" | "banned";
  avatar?: string;
  bio?: string;
  title?: string;
  socials?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type ApiCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  intro?: string;
  color: string;
  postCount: number;
};

export type ApiTag = {
  _id: string;
  name: string;
  slug: string;
  postCount: number;
};

export type ApiPost = {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  cover?: string;
  status: "draft" | "published" | "scheduled" | "archived";
  publishedAt?: string;
  featured?: boolean;
  trending?: boolean;
  readingTime: number;
  views: number;
  likes: number;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
  viewerLiked?: boolean;
  viewerBookmarked?: boolean;
  affiliateLinks?: ApiAffiliateLink[];
  faqs?: ApiFaq[];
  category: Pick<ApiCategory, "_id" | "name" | "slug" | "color">;
  author: Pick<ApiUser, "_id" | "name" | "avatar" | "role"> & { bio?: string };
  tags: Pick<ApiTag, "_id" | "name" | "slug">[];
  seo?: { title?: string; description?: string; canonical?: string; ogImage?: string; noindex?: boolean };

  // SEO Content Optimization & Geo-Targeting
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  searchIntent?: "informational" | "commercial" | "transactional" | "navigational";
  targetCountries?: string[];
  targetLanguage?: string;
  contentCluster?: { name?: string; pillar?: boolean };
  localizedFrom?: string;
  seoScore?: number;
  seoScores?: {
    keyword?: number;
    structure?: number;
    metadata?: number;
    readability?: number;
    links?: number;
    images?: number;
  };
  seoStatus?: "excellent" | "good" | "needs-improvement" | "poor";
  seoIssues?: { id: string; severity: "error" | "warning" | "good"; category: string; message: string }[];
  seoAnalyzedAt?: string;
};

/** Public, safe-to-serialize affiliate product shape (no destination URL). */
export type ApiAffiliateLink = {
  _id: string;
  name: string;
  slug: string;
  vendor?: string;
  logo?: string;
  niche?: string;
  tagline?: string;
  description?: string;
  pricingNote?: string;
  rating?: number;
  badge?: string;
  pros?: string[];
  cons?: string[];
  useCases?: string[];
  ctaLabel?: string;
  isAffiliate?: boolean;
  active?: boolean;
  // Admin-only fields (present when fetched via the admin endpoint):
  url?: string;
  clicks?: number;
  epc?: number;
  earnings?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiFaq = { question: string; answer: string };

export type ApiSubscriber = {
  _id: string;
  email: string;
  name?: string;
  source?: string;
  leadMagnet?: string;
  confirmed?: boolean;
  unsubscribedAt?: string | null;
  welcomeStep?: number;
  welcomeDone?: boolean;
  createdAt: string;
};

export type ApiComment = {
  _id: string;
  content: string;
  status: "approved" | "pending" | "flagged" | "rejected";
  likes: number;
  createdAt: string;
  author: Pick<ApiUser, "_id" | "name" | "email" | "avatar">;
  post: { _id: string; title: string; slug: string };
};

export type DashboardStats = {
  users: { total: number; active: number };
  posts: { total: number; published: number; draft: number; scheduled: number };
  categories: { total: number };
  comments: { pending: number };
  views: number;
  likes: number;
  recentPosts: ApiPost[];
  recentUsers: ApiUser[];
};

export type AnalyticsSummary = {
  windowDays: number;
  traffic: { pageviews: number; uniqueVisitors: number };
  engagement: {
    outboundClicks: number;
    ctaClicks: number;
    productClicks: number;
    newsletterSignups: number;
  };
  affiliate: {
    clicksInWindow: number;
    totalClicks: number;
    earnings: number;
    epc: number;
    topLinks: {
      _id: string;
      name: string;
      slug: string;
      clicks: number;
      epc?: number;
      earnings?: number;
    }[];
  };
  email: { subscribers: number; newInWindow: number; signupConversion: number };
  content: {
    publishedPosts: number;
    topPosts: { _id: string; title: string; slug: string; views: number; likes: number }[];
  };
};

export type UserStats = {
  total: number;
  active: number;
  pending: number;
  banned: number;
  byRole: Record<string, number>;
};
