// Shared API response types — what the backend actually returns.

export type ApiUser = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "writer" | "reader";
  status: "active" | "pending" | "banned";
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
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

export type UserStats = {
  total: number;
  active: number;
  pending: number;
  banned: number;
  byRole: Record<string, number>;
};
