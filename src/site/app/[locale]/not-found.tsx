import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import NotFoundDemo from "@/components/not-found-demo";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center py-16 md:py-24">
        <div className="mb-10">
          <NotFoundDemo />
        </div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-700 text-fg md:text-3xl">
          {t("heading")}
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-[1.7] text-muted">
          {t("body")}
        </p>
        <Link
          href={`/${locale}`}
          className="mt-8 inline-flex items-center rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark"
        >
          {t("home")}
        </Link>
      </div>
    </div>
  );
}
