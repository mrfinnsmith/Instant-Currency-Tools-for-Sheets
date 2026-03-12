import type { Metadata } from "next";
import Link from "next/link";
import { getLanguageAlternates } from "@/i18n/hreflang";
import { ogLocales, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Terms of Service | Instant Currency for Google Sheets",
    description: "Review the terms of service for Instant Currency, covering subscriptions, billing, exchange rate data, liability, and service availability.",
    alternates: {
      canonical: `/en/terms`,
      ...(locale === "en" && { languages: getLanguageAlternates("/terms") }),
    },
    openGraph: {
      title: "Terms of Service | Instant Currency for Google Sheets",
      description: "Review the terms of service for Instant Currency, covering subscriptions, billing, exchange rate data, liability, and service availability.",
      url: `https://instantcurrency.tools/${locale}/terms`,
      locale: ogLocales[locale as Locale],
    },
  };
}

export default async function Terms({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <section className="pt-16 pb-6 md:pt-24">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-700 text-fg md:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-[13px] text-faint">Last updated: March 9, 2026</p>
      </section>

      <section className="pb-20 prose-custom max-w-3xl">
        <h2>Overview</h2>
        <p>
          These terms govern your use of Instant Currency, a Google Sheets add-on
          for currency conversion. By installing or using Instant Currency, you agree
          to these terms.
        </p>

        <h2>The Service</h2>
        <p>
          Instant Currency provides currency conversion within Google Sheets. The free
          plan includes unlimited conversions with current exchange rates. The Pro plan
          ($5/month) adds historical exchange rates and priority support.
        </p>

        <h2>Subscriptions and Billing</h2>
        <p>
          Pro subscriptions are billed monthly through Stripe. You can cancel at any
          time through the customer portal, and your access will continue until the end
          of the current billing period. No refunds are issued for partial months.
        </p>

        <h2>Exchange Rate Data</h2>
        <p>
          Exchange rates are sourced from third-party providers and are provided for
          informational purposes only. We do not guarantee the accuracy, completeness,
          or timeliness of exchange rate data. Do not rely on Instant Currency for
          financial decisions requiring certified exchange rates.
        </p>

        <h2>Your Data</h2>
        <p>
          Instant Currency accesses your spreadsheet data solely to perform currency
          conversions. We do not store, transmit, or share your spreadsheet content.
          See our{" "}
          <Link href={`/${locale}/privacy`}>Privacy Policy</Link> for full details on data handling.
        </p>

        <h2>Availability</h2>
        <p>
          We strive to keep Instant Currency available and reliable, but we do not
          guarantee uninterrupted service. We may modify or discontinue features with
          reasonable notice.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          Instant Currency is provided &quot;as is&quot; without warranties of any kind.
          We are not liable for any damages arising from your use of the service,
          including but not limited to inaccurate conversions, data loss, or service
          interruptions.
        </p>

        <h2>Changes to These Terms</h2>
        <p>
          We may update these terms from time to time. Changes will be posted on this
          page with an updated revision date. Continued use of the service after changes
          constitutes acceptance of the new terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Contact us at{" "}
          <a href="mailto:hi@instantcurrency.tools">hi@instantcurrency.tools</a>.
        </p>
      </section>
    </div>
  );
}
