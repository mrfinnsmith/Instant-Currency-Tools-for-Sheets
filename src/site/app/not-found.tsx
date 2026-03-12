import Link from "next/link";
import { headers } from "next/headers";
import { Source_Serif_4, IBM_Plex_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { locales, defaultLocale, type Locale } from "@/i18n/config";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import NotFoundDemo from "@/components/not-found-demo";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const ibmPlex = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

function detectLocale(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  if (segment && locales.includes(segment as Locale)) {
    return segment as Locale;
  }
  return defaultLocale;
}

export default async function NotFound() {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const locale = detectLocale(pathname);
  const messages = (await import(`@/i18n/locales/${locale}.json`)).default;
  const t = messages.notFound;

  return (
    <html lang={locale}>
      <body
        className={`${sourceSerif.variable} ${ibmPlex.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <div className="min-h-screen flex flex-col">
            <Header />

            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16 md:py-24">
              <div className="mb-10">
                <NotFoundDemo />
              </div>

              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-700 text-fg md:text-3xl">
                {t.heading}
              </h1>
              <p className="mt-4 max-w-md text-[15px] leading-[1.7] text-muted">
                {t.body}
              </p>
              <Link
                href={`/${locale}`}
                className="mt-8 inline-flex items-center rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark"
              >
                {t.home}
              </Link>
            </div>

            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
