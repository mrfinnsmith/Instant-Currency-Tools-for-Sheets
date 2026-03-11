import type { Metadata } from "next";
import { getLanguageAlternates } from "@/i18n/hreflang";
import { ogLocales, type Locale } from "@/i18n/config";
import { CheckoutButton } from "./checkout-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Pricing",
    description:
      "Instant Currency is free forever. Upgrade to Pro for historical rates and premium support.",
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: getLanguageAlternates("/pricing"),
    },
    openGraph: {
      title: "Pricing",
      description:
        "Instant Currency is free forever. Upgrade to Pro for historical rates and premium support.",
      url: `https://instantcurrency.tools/${locale}/pricing`,
      locale: ogLocales[locale as Locale],
    },
  };
}

const MARKETPLACE_URL =
  "https://workspace.google.com/marketplace/app/instant_currency/93228277435";

export default async function Pricing({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <section className="pt-16 pb-6 md:pt-24">
        <p className="text-teal text-[13px] font-600 tracking-wide uppercase">Pricing</p>
        <h1 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-700 text-fg md:text-4xl max-w-lg">
          Free to use, with no conversion limits
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-[1.7] text-muted">
          The core add-on is completely free. Pro adds historical exchange
          rates and priority support for $5/month, cancel anytime.
        </p>
      </section>

      <section className="py-12 md:py-16 grid gap-6 md:grid-cols-2 max-w-3xl">
        {/* Free */}
        <div className="rounded-xl border border-rule bg-surface p-8">
          <p className="text-[12px] font-600 uppercase tracking-widest text-faint">Free</p>
          <p className="mt-5 font-[family-name:var(--font-heading)] text-4xl font-700 text-fg">$0</p>
          <p className="mt-1 text-[13px] text-faint">No limits, no expiration</p>

          <a
            href={MARKETPLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 block rounded-lg border border-rule bg-card py-2.5 text-center text-[14px] font-500 text-fg hover:border-teal/30 hover:shadow-sm transition-all duration-150"
          >
            Install free
          </a>

          <ul className="mt-8 space-y-3">
            {[
              "One-click currency conversion",
              "160+ currencies supported",
              "Hardcoded values, not formulas",
              "Automatic currency formatting",
              "Convert selected cells or entire sheets",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[14px] text-muted">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div className="rounded-xl border-2 border-teal bg-card p-8 shadow-sm shadow-teal/5 relative">
          <p className="text-[12px] font-600 uppercase tracking-widest text-teal">Pro</p>
          <p className="mt-5 font-[family-name:var(--font-heading)] text-4xl font-700 text-fg">
            $5
            <span className="text-xl font-400 text-faint">/mo</span>
          </p>
          <p className="mt-1 text-[13px] text-faint">Cancel anytime</p>

          <CheckoutButton locale={locale} />
          <p className="mt-2 text-[12px] text-faint">Use the same email you use with Google Sheets.</p>

          <ul className="mt-6 space-y-3">
            {[
              "Everything in the free plan",
              "Historical exchange rates for any date",
              "Priority support",
              "More features coming soon",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[14px] text-muted">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-rule py-10">
        <p className="text-[13px] text-faint">
          Already subscribed?{" "}
          <a href="https://billing.stripe.com/p/login/3cI00idzqeHZ8NT2MRfMA00" className="text-teal hover:text-teal-dark underline underline-offset-2">
            Manage your subscription
          </a>
        </p>
      </section>
    </div>
  );
}
