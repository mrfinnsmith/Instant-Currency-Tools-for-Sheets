import type { Metadata } from "next";
import { getLanguageAlternates } from "@/i18n/hreflang";
import { ogLocales, type Locale } from "@/i18n/config";
import { getMetadata } from "@/i18n/metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = getMetadata(locale as Locale);
  return {
    title: meta.success.title,
    description: meta.success.description,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `/${locale}/pricing/success`,
      languages: getLanguageAlternates("/pricing/success"),
    },
    openGraph: {
      title: meta.success.title,
      description: meta.success.description,
      url: `https://instantcurrency.tools/${locale}/pricing/success`,
      locale: ogLocales[locale as Locale],
    },
  };
}

const PORTAL_URL =
  "https://billing.stripe.com/p/login/3cI00idzqeHZ8NT2MRfMA00";

export default async function Success({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "success" });

  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <section className="pt-16 pb-6 md:pt-24 max-w-lg">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
          <svg
            className="h-6 w-6 text-teal"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mt-6 font-[family-name:var(--font-heading)] text-3xl font-700 text-fg md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-muted">
          {t("subtitle")}
        </p>
      </section>

      <section className="py-10 max-w-lg">
        <h2 className="text-[14px] font-600 text-fg">{t("gettingStarted")}</h2>
        <ol className="mt-4 space-y-4">
          {steps.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-[14px] text-muted"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10 text-[12px] font-600 text-teal">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-rule py-10">
        <p className="text-[13px] text-faint">
          {t("manage.text")}{" "}
          <a
            href={PORTAL_URL}
            className="text-teal hover:text-teal-dark underline underline-offset-2"
          >
            {t("manage.link")}
          </a>
        </p>
      </section>
    </div>
  );
}
