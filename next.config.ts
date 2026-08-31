import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Campaign photography must keep exact pure-white values for the
    // multiply blend to composite correctly, so assets are served as-is.
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
