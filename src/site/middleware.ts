import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  alternateLinks: false,
});

export const config = {
  matcher: [
    "/",
    "/(en|es|it|fr|de|ja)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
