"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const MARKETPLACE_URL =
  "https://workspace.google.com/marketplace/app/instant_currency/93228277435";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-rule/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 lg:px-8 h-[60px]">
        <Link href="/" className="flex items-center gap-2.5 group">
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
          <Link href="/pricing" className="text-[14px] text-muted hover:text-fg transition-colors duration-150">
            Pricing
          </Link>
          <Link href="/blog" className="text-[14px] text-muted hover:text-fg transition-colors duration-150">
            Blog
          </Link>
          <Link href="/contact" className="text-[14px] text-muted hover:text-fg transition-colors duration-150">
            Contact
          </Link>
          <a
            href={MARKETPLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-teal px-5 py-[7px] text-[13px] font-500 text-white shadow-sm shadow-teal/20 hover:bg-teal-dark transition-all duration-150"
          >
            Install for Sheets
          </a>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 -mr-2 text-muted hover:text-fg transition-colors"
          aria-label="Menu"
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

      {open && (
        <nav className="border-t border-rule/60 px-6 py-5 md:hidden bg-bg">
          <div className="flex flex-col gap-4">
            <Link href="/pricing" onClick={() => setOpen(false)} className="text-[14px] text-muted">Pricing</Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="text-[14px] text-muted">Blog</Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="text-[14px] text-muted">Contact</Link>
            <a href={MARKETPLACE_URL} target="_blank" rel="noopener noreferrer" className="mt-1 rounded-lg bg-teal px-5 py-2 text-center text-[13px] font-500 text-white">
              Install for Sheets
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
