import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Cap worker concurrency to prevent OS thread/process exhaustion (EAGAIN/os error 11) in cloud/container CI environments
  experimental: {
    cpus: 4,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uiftoqlzlarfkfzqnedk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
