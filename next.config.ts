import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading the dev server (JS/HMR chunks) from LAN origins, not just
  // localhost. Without this, opening the app via a machine IP (e.g. from a
  // phone, or the VS Code browser) serves the HTML but blocks the client
  // bundle — the page renders but never hydrates, so nothing is clickable.
  // NB: matched by exact string or per-segment "*" wildcard (not CIDR).
  allowedDevOrigins: [
    "172.18.96.1",
    "172.18.*.*",
    "192.168.*.*",
    "10.*.*.*",
  ],
  images: {
    // Admins can paste an arbitrary cover / OG image URL, so we allow any HTTPS
    // host rather than break on each new one (e.g. images.pexels.com). Uploads
    // still go to Cloudinary. If you'd rather lock this down, replace the
    // wildcard with an explicit list of the hosts you actually use.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Permanent (308) redirects for retired/renamed/404 URLs found in Search
  // Console. EVERY source below was verified to currently 404, and EVERY
  // destination was verified to currently return 200 — a redirect to a dead
  // page is worse than the original 404 (it hides the error behind a hop).
  async redirects() {
    return [
      // ── Casing / concatenation typos ───────────────────────────────────
      { source: "/Home", destination: "/", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/aboutAbout", destination: "/about", permanent: true },
      { source: "/contactContact", destination: "/contact", permanent: true },
      {
        source: "/category/comparisonsComparisons",
        destination: "/category/comparisons",
        permanent: true,
      },

      // ── Dead category URLs → closest live index ────────────────────────
      { source: "/category/artificial-intelligence", destination: "/blog", permanent: true },
      {
        source: "/category/education",
        destination: "/blog/best-ai-tools-for-students",
        permanent: true,
      },

      // ── Video listicles → the live video guide ─────────────────────────
      // NOTE: the old target `best-ai-tools-for-text-to-video-generators` is
      // itself a 404, so all of these point DIRECTLY at the live article
      // `ai-tools-for-a-video-generator` (one hop, no redirect chain).
      {
        source: "/blog/best-ai-tools-for-a-video-generator",
        destination: "/blog/ai-tools-for-a-video-generator",
        permanent: true,
      },
      {
        source: "/blog/best-ai-video-generators-for-creators-in-2026",
        destination: "/blog/ai-tools-for-a-video-generator",
        permanent: true,
      },
      {
        source: "/blog/best-ai-tools-for-text-to-video-generators",
        destination: "/blog/ai-tools-for-a-video-generator",
        permanent: true,
      },
      {
        source: "/blog/ai-tools-for-text-to-video-generators",
        destination: "/blog/ai-tools-for-a-video-generator",
        permanent: true,
      },

      // ── High-impression renamed slug ───────────────────────────────────
      {
        source: "/blog/the-best-chatgpt-alternatives-worth-trying",
        destination: "/blog/chatgpt-alternatives",
        permanent: true,
      },

      // ── Kepler / developer tooling ─────────────────────────────────────
      {
        source: "/blog/kepler-vs-github-copilot",
        destination: "/blog/kepler-ai-coding",
        permanent: true,
      },
      // CORRECTED: the SEO doc's target `setup-gitkraken-kepler` is a 404;
      // the real article slug is `gitkraken-kepler-tutorial`.
      {
        source: "/blog/gitkraken-kepler",
        destination: "/blog/gitkraken-kepler-tutorial",
        permanent: true,
      },
      {
        source: "/blog/the-self-taught-engineers-curriculum",
        destination: "/blog/best-free-ai-tools-for-coding-2026",
        permanent: true,
      },

      // ── SEO / search-marketing intent → SEO pillar ─────────────────────
      {
        source: "/blog/seo-in-the-age-of-answer-engines",
        destination: "/blog/best-ai-seo-tools",
        permanent: true,
      },
      {
        source: "/blog/search-marketing-course",
        destination: "/blog/best-ai-seo-tools",
        permanent: true,
      },
      {
        source: "/blog/how-to-learn-seo-at-home-for-free-complete-2026-roadmap",
        destination: "/blog/best-ai-seo-tools",
        permanent: true,
      },
      {
        source: "/blog/key-takeaways-for-mastering-rankings",
        destination: "/blog/best-ai-seo-tools",
        permanent: true,
      },

      // ── LLM / business / template dummy pages ──────────────────────────
      {
        source: "/blog/the-quiet-revolution-of-agentic-llms",
        destination: "/blog/chatgpt-vs-claude-vs-gemini-which-should-you-use",
        permanent: true,
      },
      {
        source: "/blog/why-pricing-is-strategy-not-a-number",
        destination: "/blog/ai-tools-for-small-business",
        permanent: true,
      },
      { source: "/blog/future-of-artificial-intelligence-2026", destination: "/blog", permanent: true },
      { source: "/blog/the-anatomy-of-a-supply-chain-attack", destination: "/blog", permanent: true },
      { source: "/blog/designing-with-restraint", destination: "/blog", permanent: true },

      // ── Root-level legacy URLs (no /blog/ prefix) from GSC ─────────────
      // Same dead slugs as above but served at the site root (pre-/blog/
      // structure). All 16 verified to currently 404; destinations verified
      // 200. Kept separate from the /blog/-prefixed entries above.
      {
        source: "/the-best-chatgpt-alternatives-worth-trying",
        destination: "/blog/chatgpt-alternatives",
        permanent: true,
      },
      {
        source: "/best-ai-tools-for-text-to-video-generators",
        destination: "/blog/ai-tools-for-a-video-generator",
        permanent: true,
      },
      {
        source: "/ai-tools-for-text-to-video-generators",
        destination: "/blog/ai-tools-for-a-video-generator",
        permanent: true,
      },
      {
        source: "/best-ai-video-generators-for-creators-in-2026",
        destination: "/blog/ai-tools-for-a-video-generator",
        permanent: true,
      },
      {
        source: "/kepler-vs-github-copilot",
        destination: "/blog/kepler-ai-coding",
        permanent: true,
      },
      {
        source: "/gitkraken-kepler",
        destination: "/blog/gitkraken-kepler-tutorial",
        permanent: true,
      },
      {
        source: "/seo-in-the-age-of-answer-engines",
        destination: "/blog/best-ai-seo-tools",
        permanent: true,
      },
      {
        source: "/search-marketing-course",
        destination: "/blog/best-ai-seo-tools",
        permanent: true,
      },
      {
        source: "/how-to-learn-seo-at-home-for-free-complete-2026-roadmap",
        destination: "/blog/best-ai-seo-tools",
        permanent: true,
      },
      {
        source: "/key-takeaways-for-mastering-rankings",
        destination: "/blog/best-ai-seo-tools",
        permanent: true,
      },
      { source: "/future-of-artificial-intelligence-2026", destination: "/blog", permanent: true },
      { source: "/the-anatomy-of-a-supply-chain-attack", destination: "/blog", permanent: true },
      { source: "/designing-with-restraint", destination: "/blog", permanent: true },
      {
        source: "/the-self-taught-engineers-curriculum",
        destination: "/blog/best-free-ai-tools-for-coding-2026",
        permanent: true,
      },
      {
        source: "/the-quiet-revolution-of-agentic-llms",
        destination: "/blog/chatgpt-vs-claude-vs-gemini-which-should-you-use",
        permanent: true,
      },
      {
        source: "/why-pricing-is-strategy-not-a-number",
        destination: "/blog/ai-tools-for-small-business",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
