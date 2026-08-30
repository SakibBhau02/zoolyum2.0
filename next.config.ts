import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/territory", destination: "/work", permanent: true },
      { source: "/territory/:slug", destination: "/work/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
