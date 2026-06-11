import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Transpile workspace packages
  transpilePackages: ["@freebase/db"],

  // Experimental features
  experimental: {
    // Use pnpm workspace package imports
  },

  // Image optimization config
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
