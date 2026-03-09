import type { Metadata } from "next";
import Script from "next/script";
import { Source_Serif_4, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const GA_ID = "G-DXJ8HSBLSE";

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

export const metadata: Metadata = {
  title: {
    default: "Instant Currency — Currency Conversion for Google Sheets",
    template: "%s — Instant Currency",
  },
  description:
    "Convert currencies in Google Sheets with a single click. No formulas, no copy-pasting, no formatting hassle.",
  metadataBase: new URL("https://instantcurrency.tools"),
  openGraph: {
    title: "Instant Currency — Currency Conversion for Google Sheets",
    description:
      "Convert currencies in Google Sheets with a single click.",
    url: "https://instantcurrency.tools",
    siteName: "Instant Currency",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </head>
      <body
        className={`${sourceSerif.variable} ${ibmPlex.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
