import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.singaporemaxicabs.com.sg",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/fleet",
        destination: "/fleets",
        permanent: true,
      },
      {
        source: "/fleet/:slug",
        destination: "/fleets/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
