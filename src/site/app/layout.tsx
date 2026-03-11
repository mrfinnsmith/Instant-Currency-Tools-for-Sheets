import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Instant Currency — Currency Conversion for Google Sheets",
    template: "%s — Instant Currency",
  },
  description:
    "Convert currencies in Google Sheets with a single click. No formulas, no copy-pasting, no formatting hassle.",
  metadataBase: new URL("https://instantcurrency.tools"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Instant Currency — Currency Conversion for Google Sheets",
    description:
      "Convert currencies in Google Sheets with a single click.",
    url: "https://instantcurrency.tools",
    siteName: "Instant Currency",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instant Currency — Currency Conversion for Google Sheets",
    description:
      "Convert currencies in Google Sheets with a single click. No formulas, no copy-pasting, no formatting hassle.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children as React.ReactElement;
}
