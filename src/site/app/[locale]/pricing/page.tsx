import type { Metadata } from "next";
import { getLanguageAlternates } from "@/i18n/hreflang";
import { ogLocales, type Locale } from "@/i18n/config";
import { getMetadata } from "@/i18n/metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckoutButton } from "./checkout-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = getMetadata(locale as Locale);
  return {
    title: meta.pricing.title,
    description: meta.pricing.description,
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: getLanguageAlternates("/pricing"),
    },
    openGraph: {
      title: meta.pricing.title,
      description: meta.pricing.description,
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
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pricing" });

  const freeFeatures = [
    t("free.feature1"),
    t("free.feature2"),
    t("free.feature3"),
    t("free.feature4"),
    t("free.feature5"),
  ];

  const proFeatures = [
    t("pro.feature1"),
    t("pro.feature2"),
    t("pro.feature3"),
    t("pro.feature4"),
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <section className="pt-16 pb-6 md:pt-24">
        <p className="text-teal text-[13px] font-600 tracking-wide uppercase">{t("label")}</p>
        <h1 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-700 text-fg md:text-4xl max-w-lg">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-[1.7] text-muted">
          {t("subtitle")}
        </p>
      </section>

      <section className="py-12 md:py-16 grid gap-6 md:grid-cols-2 max-w-3xl">
        {/* Free */}
        <div className="rounded-xl border border-rule bg-surface p-8">
          <p className="text-[12px] font-600 uppercase tracking-widest text-faint">{t("free.tier")}</p>
          <p className="mt-5 font-[family-name:var(--font-heading)] text-4xl font-700 text-fg">$0</p>
          <p className="mt-1 text-[13px] text-faint">{t("free.note")}</p>

          <a
            href={MARKETPLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 block rounded-lg border border-rule bg-card py-2.5 text-center text-[14px] font-500 text-fg hover:border-teal/30 hover:shadow-sm transition-all duration-150"
          >
            {t("free.button")}
          </a>

          <ul className="mt-8 space-y-3">
            {freeFeatures.map((f) => (
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
          <p className="text-[12px] font-600 uppercase tracking-widest text-teal">{t("pro.tier")}</p>
          <p className="mt-5 font-[family-name:var(--font-heading)] text-4xl font-700 text-fg">
            $5
            <span className="text-xl font-400 text-faint">{t("pro.perMonth")}</span>
          </p>
          <p className="mt-1 text-[13px] text-faint">{t("pro.note")}</p>

          <CheckoutButton
            locale={locale}
            buttonText={t("pro.button")}
            loadingText={t("pro.buttonLoading")}
          />
          <p className="mt-2 text-[12px] text-faint">{t("pro.emailHint")}</p>

          <ul className="mt-6 space-y-3">
            {proFeatures.map((f) => (
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
          {t("manage.text")}{" "}
          <a href="https://billing.stripe.com/p/login/3cI00idzqeHZ8NT2MRfMA00" className="text-teal hover:text-teal-dark underline underline-offset-2">
            {t("manage.link")}
          </a>
        </p>
      </section>
    </div>
  );
}
