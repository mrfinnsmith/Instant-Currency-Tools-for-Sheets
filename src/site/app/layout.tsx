import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Google Sheets Currency Converter — Instant Currency",
    template: "%s — Instant Currency",
  },
  description:
    "Convert currencies in Google Sheets with a single click. Real-time exchange rates, automatic formatting, and no formulas required. Free to install.",
  metadataBase: new URL("https://instantcurrency.tools"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Google Sheets Currency Converter — Instant Currency",
    description:
      "Convert currencies in Google Sheets with a single click. Real-time exchange rates, automatic formatting, and no formulas required.",
    url: "https://instantcurrency.tools",
    siteName: "Instant Currency",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Google Sheets Currency Converter — Instant Currency",
    description:
      "Convert currencies in Google Sheets with a single click. Real-time exchange rates, automatic formatting, and no formulas required. Free to install.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children as React.ReactElement;
}
