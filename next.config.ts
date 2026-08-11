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
};

export default nextConfig;
