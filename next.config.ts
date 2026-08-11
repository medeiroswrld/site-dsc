import type { NextConfig } from "next";

/**
 * Vehicle photos are served from Supabase Storage, and next/image refuses any
 * host it was not told about. The hostname is derived from the same env var
 * the app uses, so connecting a project is still a one-file change.
 */
const supabaseHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).hostname : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A stray lockfile in the home directory makes Next guess the wrong project
  // root, which changes what gets bundled for deployment. Pin it.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    formats: ["image/avif", "image/webp"],
    /**
     * next/image re-encodes every photo it serves, and its default quality of
     * 75 lands on top of the compression the browser already applied at
     * upload. Two lossy passes over what started as a camera JPEG is what
     * makes vehicle shots look washed out. 90 costs a few KB and keeps the
     * detail buyers zoom into — paint finish, wheels, interior stitching.
     */
    qualities: [75, 90],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  poweredByHeader: false,
};

export default nextConfig;
