import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/peyflex/:path*",
        destination: "https://client.peyflex.com.ng/api/:path*",
      },
      {
        source: "/api/:path*",
        destination: "https://dataapi-connectorstech7925-bkgjyvzf.leapcell.dev/api/:path*",
      },
      {
        source: "/webhooks/:path*",
        destination: "https://dataapi-connectorstech7925-bkgjyvzf.leapcell.dev/webhooks/:path*",
      },
      {
        source: "/health",
        destination: "https://dataapi-connectorstech7925-bkgjyvzf.leapcell.dev/health",
      }
    ];
  },
};

export default nextConfig;
