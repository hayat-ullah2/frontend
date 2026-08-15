// Single source of truth for site-level constants. Import from here everywhere.
// Canonical/base URL. Override with NEXT_PUBLIC_SITE_URL in production so a
// preview/staging deploy never leaks its own domain into canonical tags,
// sitemaps or Open Graph URLs.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexversal.com";
export const SITE_NAME = "Nexversal";
export const SITE_DESCRIPTION =
  "Nexversal reviews and compares the best AI tools and software — hands-on reviews, side-by-side comparisons, pricing breakdowns and practical how-to guides for writing, coding, images, video, business and productivity.";
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
