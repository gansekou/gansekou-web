import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/api/v1/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.gansekou.com",
        pathname: "/api/v1/uploads/**",
      },
      {
        protocol: "https",
        hostname: "pub-1ea23db8727a435aa728115bd8c19a9d.r2.dev",
        pathname: "/banners/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
