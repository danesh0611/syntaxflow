import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://syntaxflowarticles.pages.dev/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
