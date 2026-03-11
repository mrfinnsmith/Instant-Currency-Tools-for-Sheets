import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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

export default withNextIntl(nextConfig);
