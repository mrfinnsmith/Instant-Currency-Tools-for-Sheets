import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMetadata } from "@/i18n/metadata";
import { getLanguageAlternates } from "@/i18n/hreflang";
import { ogLocales, type Locale } from "@/i18n/config";

const MARKETPLACE_URL =
  "https://workspace.google.com/marketplace/app/instant_currency/93228277435";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const meta = getMetadata(locale as Locale);
  return {
    title: { absolute: meta.home.title },
    description: meta.home.description,
    alternates: {
      canonical: `/${locale}`,
      languages: getLanguageAlternates(""),
    },
    openGraph: {
      title: meta.home.title,
      description: meta.home.description,
      url: `https://instantcurrency.tools/${locale}`,
      siteName: "Instant Currency",
      type: "website" as const,
      locale: ogLocales[locale as Locale],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: meta.home.title,
      description: meta.home.description,
    },
  };
}

function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Instant Currency",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free",
      },
      {
        "@type": "Offer",
        price: "5.00",
        priceCurrency: "USD",
        name: "Pro",
        billingIncrement: "P1M",
      },
    ],
    description:
      "Convert currencies in Google Sheets with a single click. No formulas, no copy-pasting, no formatting hassle.",
    url: "https://instantcurrency.tools",
    installUrl: MARKETPLACE_URL,
    softwareRequirements: "Google Sheets",
    publisher: {
      "@type": "Organization",
      name: "Instant Currency",
      url: "https://instantcurrency.tools",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <>
      <JsonLd />

      {/* ── Hero ── */}
      <section className="hero-gradient relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 lg:px-8 pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="md:flex md:items-center md:gap-12 lg:gap-16">
            <div className="md:flex-1">
              <p className="text-teal-mist/70 text-[13px] font-500 tracking-wide uppercase">
                {t("hero.label")}
              </p>
              <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-700 leading-[1.12] tracking-tight text-white md:text-[3.25rem] lg:text-[3.5rem]">
                {t("hero.title")}
              </h1>
              <p className="mt-6 text-[17px] leading-[1.7] text-white/75">
                {t("hero.body")}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href={MARKETPLACE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-white px-7 py-3 text-[14px] font-600 text-teal-deeper shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 transition-all duration-200"
                >
                  {t("hero.installFree")}
                </a>
                <a
                  href={`/${locale}/pricing`}
                  className="rounded-lg border border-white/25 px-7 py-3 text-[14px] font-500 text-white/90 hover:bg-white/10 transition-all duration-200"
                >
                  {t("hero.viewPricing")}
                </a>
              </div>
            </div>

            <div className="mt-12 md:mt-0 md:flex-1">
              <div className="overflow-hidden rounded-xl shadow-2xl shadow-black/20 border border-white/10">
                <Image
                  src="/marketing1.png"
                  alt={t("hero.screenshotAlt")}
                  width={600}
                  height={375}
                  className="w-full"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product showcase ── */}
      <section className="bg-surface dot-pattern">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-16 md:py-24">
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {[
              { src: "/marketing2.png", alt: t("showcase.formattingAlt") },
              { src: "/marketing3.png", alt: t("showcase.datePickerAlt") },
            ].map((img) => (
              <div
                key={img.src}
                className="group overflow-hidden rounded-xl border border-rule bg-card shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={600}
                  height={375}
                  className="w-full transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="bg-bg">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-xl">
            <p className="text-teal text-[13px] font-600 tracking-wide uppercase">
              {t("capabilities.label")}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-700 text-fg leading-tight">
              {t("capabilities.title")}
            </h2>
          </div>

          <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: t("capabilities.valuesTitle"), body: t("capabilities.valuesBody") },
              { title: t("capabilities.formattingTitle"), body: t("capabilities.formattingBody") },
              { title: t("capabilities.currenciesTitle"), body: t("capabilities.currenciesBody") },
              { title: t("capabilities.historicalTitle"), body: t("capabilities.historicalBody") },
              { title: t("capabilities.sheetTitle"), body: t("capabilities.sheetBody") },
              { title: t("capabilities.formulaTitle"), body: t("capabilities.formulaBody") },
            ].map((item) => (
              <div key={item.title} className="border-t border-rule pt-6">
                <h3 className="text-[15px] font-600 text-fg">{item.title}</h3>
                <p className="mt-2.5 text-[14px] leading-[1.7] text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who uses it ── */}
      <section className="bg-teal-mist border-y border-teal/8">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-16 md:py-24">
          <p className="text-teal text-[13px] font-600 tracking-wide uppercase">
            {t("personas.label")}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-700 text-fg leading-tight">
            {t("personas.title")}
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: t("personas.pmTitle"), body: t("personas.pmBody") },
              { title: t("personas.financeTitle"), body: t("personas.financeBody") },
              { title: t("personas.travelTitle"), body: t("personas.travelBody") },
            ].map((persona) => (
              <div key={persona.title} className="rounded-xl bg-card border border-teal/10 p-7 shadow-sm">
                <p className="font-[family-name:var(--font-heading)] text-lg font-600 text-fg">
                  {persona.title}
                </p>
                <p className="mt-3 text-[14px] leading-[1.7] text-muted">
                  {persona.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-bg">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-20 md:py-28">
          <div className="rounded-2xl hero-gradient relative overflow-hidden p-10 md:p-16 shadow-xl shadow-teal/10">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div className="relative max-w-lg">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-700 text-white md:text-3xl">
                {t("cta.title")}
              </h2>
              <p className="mt-4 text-[15px] leading-[1.7] text-white/75">
                {t("cta.body")}
              </p>
              <a
                href={MARKETPLACE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded-lg bg-white px-7 py-3 text-[14px] font-600 text-teal-deeper shadow-lg shadow-black/10 hover:shadow-xl transition-all duration-200"
              >
                {t("cta.button")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
