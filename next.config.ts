import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://dataapi-connectorstech7925-t9vnrjmbf6zbpor48c.leapcell-async.dev/api/:path*",
      },
      {
        source: "/webhooks/:path*",
        destination: "https://dataapi-connectorstech7925-t9vnrjmbf6zbpor48c.leapcell-async.dev/webhooks/:path*",
      },
      {
        source: "/health",
        destination: "https://dataapi-connectorstech7925-t9vnrjmbf6zbpor48c.leapcell-async.dev/health",
      }
    ];
  },
};

export default nextConfig;
