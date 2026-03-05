import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "next/font/google": path.join(__dirname, "lib/font-shim"),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "next/font/google": "./lib/font-shim",
    },
  },
  async headers() {
    return [
      {
        // Apply security + SEO headers to all public routes
        source: "/(about|pricing|sales|register|login)?",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large, max-snippet:-1",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        // Block indexing of private/app pages
        source: "/(dashboard|systems|api|profile)(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
