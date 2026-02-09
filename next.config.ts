import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.111',
      },
      {
        protocol: 'https',
        hostname: '*.minio.io',
      },
      // Allow any hostname for flexibility in deployment
      {
        protocol: 'http',
        hostname: '*',
      },
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
};

export default nextConfig;
