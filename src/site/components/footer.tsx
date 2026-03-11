"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const th = useTranslations("header");
  const locale = useLocale();

  return (
    <footer className="border-t border-rule bg-surface">
      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Instant Currency" width={28} height={28} className="rounded-lg" />
              <span className="font-[family-name:var(--font-heading)] text-[15px] font-600 text-fg">
                Instant Currency
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-faint">
              {t("tagline")}
            </p>
          </div>

          <div className="flex gap-20">
            <div>
              <p className="text-[11px] font-600 uppercase tracking-widest text-faint">{t("product")}</p>
              <ul className="mt-4 space-y-2.5">
                <li><Link href={`/${locale}/pricing`} className="text-[13px] text-muted hover:text-fg transition-colors">{th("pricing")}</Link></li>
                <li><Link href={`/${locale}/blog`} className="text-[13px] text-muted hover:text-fg transition-colors">{th("blog")}</Link></li>
                <li>
                  <a href="https://workspace.google.com/marketplace/app/instant_currency/93228277435" target="_blank" rel="noopener noreferrer" className="text-[13px] text-muted hover:text-fg transition-colors">
                    {t("marketplace")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-600 uppercase tracking-widest text-faint">{t("support")}</p>
              <ul className="mt-4 space-y-2.5">
                <li><Link href={`/${locale}/contact`} className="text-[13px] text-muted hover:text-fg transition-colors">{th("contact")}</Link></li>
                <li><Link href={`/${locale}/privacy`} className="text-[13px] text-muted hover:text-fg transition-colors">{t("privacyPolicy")}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-rule pt-7">
          <p className="text-[11px] text-faint tracking-wide">
            &copy; {new Date().getFullYear()} {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
