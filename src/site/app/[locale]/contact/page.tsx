import type { Metadata } from "next";
import { getLanguageAlternates } from "@/i18n/hreflang";
import { ogLocales, type Locale } from "@/i18n/config";
import { getMetadata } from "@/i18n/metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "./contact-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = getMetadata(locale as Locale);
  return {
    title: meta.contact.title,
    description: meta.contact.description,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: getLanguageAlternates("/contact"),
    },
    openGraph: {
      title: meta.contact.title,
      description: meta.contact.description,
      url: `https://instantcurrency.tools/${locale}/contact`,
      locale: ogLocales[locale as Locale],
    },
  };
}

export default async function Contact({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <section className="pt-16 pb-6 md:pt-24">
        <p className="text-teal text-[13px] font-600 tracking-wide uppercase">{t("label")}</p>
        <h1 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-700 text-fg md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-muted max-w-lg">
          {t("subtitle")}
        </p>
      </section>
      <section className="pb-20 max-w-md">
        <ContactForm
          locale={locale}
          labels={{
            name: t("form.name"),
            email: t("form.email"),
            message: t("form.message"),
            send: t("form.send"),
            sending: t("form.sending"),
            error: t("form.error"),
            sentTitle: t("sent.title"),
            sentBody: t("sent.body"),
          }}
        />
      </section>
    </div>
  );
}
