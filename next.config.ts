import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
