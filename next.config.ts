import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://davis-jesse-victor-fan.trycloudflare.com/api/:path*",
      },
      {
        source: "/webhooks/:path*",
        destination: "https://davis-jesse-victor-fan.trycloudflare.com/webhooks/:path*",
      },
      {
        source: "/health",
        destination: "https://davis-jesse-victor-fan.trycloudflare.com/health",
      }
    ];
  },
};

export default nextConfig;
