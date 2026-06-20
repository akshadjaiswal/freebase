import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Standalone output for Docker deployment
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,

  // Transpile workspace packages
  transpilePackages: ["@freebase/db"],

  // Experimental features
  experimental: {
    staleTimes: {
      dynamic: 300, // 5 min — admin [org] pages cached client-side (default: 30s)
      static: 300,
    },
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
