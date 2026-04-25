import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://data-api-8a5a.onrender.com/api/:path*",
      },
      {
        source: "/webhooks/:path*",
        destination: "https://data-api-8a5a.onrender.com/webhooks/:path*",
      },
      {
        source: "/health",
        destination: "https://data-api-8a5a.onrender.com/health",
      }
    ];
  },
};

export default nextConfig;
