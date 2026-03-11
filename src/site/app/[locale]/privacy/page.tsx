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
    title: "Privacy Policy",
    description: "Privacy policy for the Instant Currency Google Sheets add-on.",
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: getLanguageAlternates("/privacy"),
    },
    openGraph: {
      title: "Privacy Policy",
      description: "Privacy policy for the Instant Currency Google Sheets add-on.",
      url: `https://instantcurrency.tools/${locale}/privacy`,
      locale: ogLocales[locale as Locale],
    },
  };
}

export default async function Privacy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <section className="pt-16 pb-6 md:pt-24">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-700 text-fg md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-[13px] text-faint">Last updated: March 8, 2026</p>
      </section>

      <section className="pb-20 prose-custom max-w-3xl">
        <h2>Overview</h2>
        <p>
          Instant Currency (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is a Google Sheets add-on
          that converts currency values. We respect your privacy and are committed
          to protecting your data.
        </p>

        <h2>Data We Collect</h2>
        <p>
          When you use Instant Currency, the add-on accesses data in your Google Sheets
          spreadsheet solely to perform currency conversions. We do not store, transmit,
          or share your spreadsheet data with third parties.
        </p>
        <p>
          We collect anonymous usage analytics to improve the product. This includes
          events such as conversions performed, currencies selected, and feature usage.
          Analytics data is collected through Mixpanel and does not include your
          spreadsheet content or personal data beyond a hashed user identifier.
        </p>

        <h2>Website Analytics</h2>
        <p>
          Our website uses Google Analytics to understand how visitors interact with
          the site. Google Analytics collects information such as pages visited, time
          spent on pages, and referral sources. This data is aggregated and anonymous.
        </p>

        <h2>Google API Services</h2>
        <p>
          Instant Currency&apos;s use and transfer of information received from Google
          APIs adheres to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>

        <h2>Payment Information</h2>
        <p>
          If you purchase a Pro subscription, payment processing is handled entirely
          by Stripe. We do not store or have access to your credit card details.
          Stripe&apos;s privacy policy governs how your payment information is handled.
        </p>

        <h2>Cookies</h2>
        <p>
          Our website uses cookies for analytics purposes (Google Analytics and
          Mixpanel). These cookies help us understand site usage patterns. You can
          disable cookies through your browser settings.
        </p>

        <h2>Data Retention</h2>
        <p>
          Anonymous analytics data is retained for up to 24 months. We do not retain
          any spreadsheet data.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Changes will be posted
          on this page with an updated revision date.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions about this privacy policy, contact us at{" "}
          <a href="mailto:hi@instantcurrency.tools">hi@instantcurrency.tools</a>.
        </p>

        <p>
          See also our <Link href={`/${locale}/terms`}>Terms of Service</Link>.
        </p>
      </section>
    </div>
  );
}
