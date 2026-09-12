import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so an unrelated lockfile in a parent directory
  // (e.g. ~/package-lock.json) doesn't get picked up.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      // Google OAuth avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
