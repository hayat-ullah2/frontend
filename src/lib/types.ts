export type Category = {
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  postCount: number;
};

export type Tag = {
  slug: string;
  name: string;
  postCount: number;
};

export type Author = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  cover: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  postsCount: number;
  followers: number;
  views: number;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  category: string;
  tags: string[];
  authorSlug: string;
  publishedAt: string;
  readingTime: number;
  views: number;
  likes: number;
  comments: number;
  featured?: boolean;
  trending?: boolean;
};

export type Comment = {
  id: string;
  postSlug: string;
  author: string;
  avatar: string;
  date: string;
  content: string;
  likes: number;
};
