import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://dataapi-ammicsystems4174-jwcvwnu9.leapcell.dev/api/:path*",
      },
      {
        source: "/webhooks/:path*",
        destination: "https://dataapi-ammicsystems4174-jwcvwnu9.leapcell.dev/webhooks/:path*",
      },
      {
        source: "/health",
        destination: "https://dataapi-ammicsystems4174-jwcvwnu9.leapcell.dev/health",
      }
    ];
  },
};

export default nextConfig;
