import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the trace root to this project — an unrelated lockfile further up the
  // user's home directory otherwise wins the inference.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    formats: ["image/avif", "image/webp"],
    // Integration point: add the CDN/storage hostname that will serve the
    // real D.S.C. vehicle photography once the media pipeline is connected.
    remotePatterns: [],
  },
  poweredByHeader: false,
};

export default nextConfig;
