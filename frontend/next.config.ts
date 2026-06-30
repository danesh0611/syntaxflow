import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/studio/:path*',
        destination: '/studio/index.html',
      },
    ];
  },
};

export default nextConfig;
