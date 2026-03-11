"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";

const MARKETPLACE_URL =
  "https://workspace.google.com/marketplace/app/instant_currency/93228277435";

export function Header() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("header");
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-rule/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 lg:px-8 h-[60px]">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="Instant Currency"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-[family-name:var(--font-heading)] text-base font-600 text-fg">
            Instant Currency
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href={`/${locale}/pricing`} className="text-[14px] text-muted hover:text-fg transition-colors duration-150">
            {t("pricing")}
          </Link>
          <Link href={`/${locale}/blog`} className="text-[14px] text-muted hover:text-fg transition-colors duration-150">
            {t("blog")}
          </Link>
          <Link href={`/${locale}/contact`} className="text-[14px] text-muted hover:text-fg transition-colors duration-150">
            {t("contact")}
          </Link>
          <LanguageSwitcher />
          <a
            href={MARKETPLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-teal px-5 py-[7px] text-[13px] font-500 text-white shadow-sm shadow-teal/20 hover:bg-teal-dark transition-all duration-150"
          >
            {t("installForSheets")}
          </a>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 -mr-2 text-muted hover:text-fg transition-colors"
            aria-label={t("menu")}
          >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-rule/60 px-6 py-5 md:hidden bg-bg">
          <div className="flex flex-col gap-4">
            <Link href={`/${locale}/pricing`} onClick={() => setOpen(false)} className="text-[14px] text-muted">{t("pricing")}</Link>
            <Link href={`/${locale}/blog`} onClick={() => setOpen(false)} className="text-[14px] text-muted">{t("blog")}</Link>
            <Link href={`/${locale}/contact`} onClick={() => setOpen(false)} className="text-[14px] text-muted">{t("contact")}</Link>
            <a href={MARKETPLACE_URL} target="_blank" rel="noopener noreferrer" className="mt-1 rounded-lg bg-teal px-5 py-2 text-center text-[13px] font-500 text-white">
              {t("installForSheets")}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
