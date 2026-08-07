import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admins can paste an arbitrary cover / OG image URL, so we allow any HTTPS
    // host rather than break on each new one (e.g. images.pexels.com). Uploads
    // still go to Cloudinary. If you'd rather lock this down, replace the
    // wildcard with an explicit list of the hosts you actually use.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
