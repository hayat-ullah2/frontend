// Single source of truth for site-level constants. Import from here everywhere.
// Replace SITE_URL with your production domain when you deploy.
export const SITE_URL = "https://MYDOMAIN.com";
export const SITE_NAME = "NexBlog";
export const SITE_DESCRIPTION =
  "NexBlog is a modern, multi-niche publication covering technology, AI, programming, business, finance, lifestyle and more.";
export const SITE_LOCALE = "en_US";

// Author of the site (used in RSS + JSON-LD publisher).
export const SITE_AUTHOR = "NexBlog Editorial";

// Social profiles — used in Organization schema `sameAs`.
export const SITE_SOCIAL = {
  twitter: "https://twitter.com/nexblog",
  github: "https://github.com/nexblog",
  linkedin: "https://linkedin.com/company/nexblog",
};

// Build an absolute URL for a path.
export const absoluteUrl = (path: string) => {
  if (!path) return SITE_URL;
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
