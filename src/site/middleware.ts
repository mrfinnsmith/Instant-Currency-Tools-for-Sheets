import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  alternateLinks: false,
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    "/",
    "/(en|es|it|fr|de|ja)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
