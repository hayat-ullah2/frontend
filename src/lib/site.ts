// Single source of truth for site-level constants. Import from here everywhere.
// Canonical/base URL. Override with NEXT_PUBLIC_SITE_URL in production so a
// preview/staging deploy never leaks its own domain into canonical tags,
// sitemaps or Open Graph URLs.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexversal.com";
export const SITE_NAME = "Nexversal";
export const SITE_DESCRIPTION =
  "Nexversal reviews and compares the best AI tools and software — independent reviews, research, side-by-side comparisons, pricing breakdowns and practical how-to guides for writing, coding, images, video, business and productivity.";
export const SITE_LOCALE = "en_US";

// Author of the site (used in RSS + JSON-LD publisher fallback).
export const SITE_AUTHOR = "Hayat Ullah";

// Canonical author identity for the whole publication. Nexversal is a
// single-author site: every post is bylined to the founder/editor and the
// byline links to the About page (full bio + externally verifiable profiles).
// Keeping the identity here — not in per-post free text — guarantees ONE
// consistent, verifiable author across byline, Open Graph, RSS and JSON-LD,
// which is what Google's E-E-A-T review (and AdSense) looks for.
export const SITE_AUTHOR_INFO = {
  name: "Hayat Ullah",
  role: "Founder & Editor",
  // Destination for the byline link — the About page already carries the full
  // founder bio with external corroboration.
  profilePath: "/about",
  // schema.org Person.sameAs — external profiles that corroborate the identity.
  sameAs: [
    "https://github.com/hayat-ullah2",
    "https://www.linkedin.com/in/hayat-ullah-dev",
  ],
};

// Below this many views/likes, we hide the count in the UI rather than show a
// tiny (or zero) number that reads as low-traffic. (Task 2d)
export const VIEWS_DISPLAY_THRESHOLD = 1000;

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
