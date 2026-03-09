import Image from "next/image";

const MARKETPLACE_URL =
  "https://workspace.google.com/marketplace/app/instant_currency/93228277435";

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Subtle grid overlay for texture */}
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
            {/* Left: copy */}
            <div className="md:flex-1">
              <p className="text-teal-mist/70 text-[13px] font-500 tracking-wide uppercase">
                Google Sheets Add-on
              </p>
              <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-700 leading-[1.12] tracking-tight text-white md:text-[3.25rem] lg:text-[3.5rem]">
                Convert currencies in your spreadsheet without the busywork
              </h1>
              <p className="mt-6 text-[17px] leading-[1.7] text-white/75">
                Instant Currency writes converted values directly into your cells
                with correct formatting. 160+ currencies. Historical rates going
                back decades. No formulas to maintain.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href={MARKETPLACE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-white px-7 py-3 text-[14px] font-600 text-teal-deeper shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 transition-all duration-200"
                >
                  Install free
                </a>
                <a
                  href="/pricing"
                  className="rounded-lg border border-white/25 px-7 py-3 text-[14px] font-500 text-white/90 hover:bg-white/10 transition-all duration-200"
                >
                  View pricing
                </a>
              </div>
            </div>

            {/* Right: product screenshot */}
            <div className="mt-12 md:mt-0 md:flex-1">
              <div className="overflow-hidden rounded-xl shadow-2xl shadow-black/20 border border-white/10">
                <Image
                  src="/marketing1.png"
                  alt="The Instant Currency sidebar open in Google Sheets, converting USD amounts to multiple currencies including EUR, GBP, JPY, BRL, MXN, and ILS"
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
              { src: "/marketing2.png", alt: "Spreadsheet with automatic currency formatting applied to yen, dollars, rupees, euros, pounds, Swiss francs, and Korean won" },
              { src: "/marketing3.png", alt: "Instant Currency date picker for selecting historical exchange rates, showing February 2024 calendar" },
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
              What you get
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-700 text-fg leading-tight">
              Everything the GOOGLEFINANCE function should have been
            </h2>
          </div>

          <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Values, not formulas",
                body: "Converted amounts are written as plain numbers. They don't update behind your back, error out randomly, or break when you copy a sheet.",
              },
              {
                title: "Correct currency formatting",
                body: "Yen gets zero decimals. Swiss francs get apostrophe separators. Rupees use the lakh system. Each currency's display rules are applied to the cell.",
              },
              {
                title: "160+ currencies",
                body: "Every major currency and most minor ones. If it has an ISO 4217 code and a reliable exchange rate source, it's in the list.",
              },
              {
                title: "Historical rates",
                body: "Pick any date going back decades and convert at that day's exchange rate. Useful for expense reports, audits, and invoice reconciliation.",
              },
              {
                title: "Entire sheet conversion",
                body: "Convert a selection of cells or toggle on whole-sheet mode to convert every value in the active sheet at once.",
              },
              {
                title: "Google Finance formula mode",
                body: "Prefer live-updating formulas? Toggle the GOOGLEFINANCE option to insert formulas instead of hardcoded values.",
              },
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
            Built for
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-700 text-fg leading-tight">
            People who work across borders
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-card border border-teal/10 p-7 shadow-sm">
              <p className="font-[family-name:var(--font-heading)] text-lg font-600 text-fg">
                Project managers
              </p>
              <p className="mt-3 text-[14px] leading-[1.7] text-muted">
                Budgets, vendor quotes, and expense reports arrive in different
                currencies. You need everything in one base currency for
                stakeholder reporting. This does that in seconds.
              </p>
            </div>
            <div className="rounded-xl bg-card border border-teal/10 p-7 shadow-sm">
              <p className="font-[family-name:var(--font-heading)] text-lg font-600 text-fg">
                Finance teams
              </p>
              <p className="mt-3 text-[14px] leading-[1.7] text-muted">
                Month-end close with international subsidiaries. Consolidating
                invoices, payroll, and vendor payments across currencies into
                a single reporting workbook.
              </p>
            </div>
            <div className="rounded-xl bg-card border border-teal/10 p-7 shadow-sm">
              <p className="font-[family-name:var(--font-heading)] text-lg font-600 text-fg">
                International travelers
              </p>
              <p className="mt-3 text-[14px] leading-[1.7] text-muted">
                Tracking trip expenses across countries. Logging costs in local
                currencies and converting them to your home currency to see
                actual spending.
              </p>
            </div>
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
                Try Instant Currency
              </h2>
              <p className="mt-4 text-[15px] leading-[1.7] text-white/75">
                Install from the Google Workspace Marketplace. Free with no
                account or sign-up required. Convert your first cell in under
                a minute.
              </p>
              <a
                href={MARKETPLACE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded-lg bg-white px-7 py-3 text-[14px] font-600 text-teal-deeper shadow-lg shadow-black/10 hover:shadow-xl transition-all duration-200"
              >
                Install for Google Sheets
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
