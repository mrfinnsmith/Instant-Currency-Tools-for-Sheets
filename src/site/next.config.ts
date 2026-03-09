import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/google-sheets-currency-conversion",
        destination: "/blog/google-sheets-currency-conversion",
        permanent: true,
      },
      {
        source: "/google-sheets-currency-conversion/",
        destination: "/blog/google-sheets-currency-conversion",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
