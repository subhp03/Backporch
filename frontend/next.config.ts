import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so an unrelated lockfile in a parent directory
  // (e.g. ~/package-lock.json) doesn't get picked up.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
