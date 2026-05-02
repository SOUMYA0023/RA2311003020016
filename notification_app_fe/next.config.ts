import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow TypeScript transpilation of files outside the src directory
  transpilePackages: [],
};

export default nextConfig;
