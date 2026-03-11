"use client";

import { Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

function LanguageSwitcherInner() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("header");

  const switchLocale = (newLocale: Locale) => {
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    const newPath = `/${newLocale}${pathnameWithoutLocale === "/" ? "" : pathnameWithoutLocale}`;
    const query = searchParams.toString();
    const fullPath = query ? `${newPath}?${query}` : newPath;
    router.push(fullPath);
  };

  return (
    <select
      value={locale}
      onChange={(e) => switchLocale(e.target.value as Locale)}
      className="rounded-md border border-rule bg-bg px-2 py-1 text-[13px] text-muted hover:text-fg transition-colors cursor-pointer"
      aria-label={t("language")}
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeNames[loc]}
        </option>
      ))}
    </select>
  );
}

export function LanguageSwitcher() {
  return (
    <Suspense>
      <LanguageSwitcherInner />
    </Suspense>
  );
}
