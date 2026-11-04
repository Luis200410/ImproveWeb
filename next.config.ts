import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'me7aitdbxq.ufs.sh',
      }
    ],
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
  async redirects() {
    return [
      {
        source: '/apps/execution-productivity',
        destination: '/apps/productivity',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Relationships hangout invites: static pages in public/ (the plan rides after #, never sent here).
      { source: '/b', destination: '/b/index.html' },
      { source: '/v', destination: '/v/index.html' },
    ];
  },
  async headers() {
    return [
      {
        // Universal links (Plaid OAuth → Money app): iOS wants JSON, no redirect.
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        // Relationships invite + vote pages: never indexed, no referrer.
        source: "/b",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        // Relationships invite + vote pages: never indexed, no referrer.
        source: "/b/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        // Relationships invite + vote pages: never indexed, no referrer.
        source: "/v",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        // Relationships invite + vote pages: never indexed, no referrer.
        source: "/v/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        // Apply security + SEO headers to all public routes
        source: "/(blog|pricing|sales|register|login)?",
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
