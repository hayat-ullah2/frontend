// Single source of truth for site-level constants. Import from here everywhere.
// Replace SITE_URL with your production domain when you deploy.
export const SITE_URL = "https://nexversal.com";
export const SITE_NAME = "Nexversal";
export const SITE_DESCRIPTION =
  "Nexversal is a modern, multi-niche publication covering technology, AI, programming, business, finance, lifestyle and more.";
export const SITE_LOCALE = "en_US";

// Author of the site (used in RSS + JSON-LD publisher).
export const SITE_AUTHOR = "Nexversal Editorial";

// Social profiles — used in Organization schema `sameAs`.
export const SITE_SOCIAL = {
  twitter: "https://twitter.com/nexversal",
  github: "https://github.com/nexversal",
  linkedin: "https://linkedin.com/company/nexversal",
};

// Build an absolute URL for a path.
export const absoluteUrl = (path: string) => {
  if (!path) return SITE_URL;
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
