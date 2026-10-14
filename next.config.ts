import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://nil-folder-mens-identify.trycloudflare.com/api/:path*",
      },
      {
        source: "/webhooks/:path*",
        destination: "https://nil-folder-mens-identify.trycloudflare.com/webhooks/:path*",
      },
      {
        source: "/health",
        destination: "https://nil-folder-mens-identify.trycloudflare.com/health",
      }
    ];
  },
};

export default nextConfig;
