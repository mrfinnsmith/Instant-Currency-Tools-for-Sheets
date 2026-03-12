"use client";

import { useState, useEffect, useCallback } from "react";

type LocaleData = {
  labels: string[];
  targetCurrency: string;
  targetSymbol: string;
  sheetTab: string;
};

const localeData: Record<string, LocaleData> = {
  en: {
    labels: ["Rent", "Groceries", "Software", "Travel", "Meals"],
    targetCurrency: "USD",
    targetSymbol: "$",
    sheetTab: "Expenses",
  },
  es: {
    labels: ["Renta", "Despensa", "Software", "Viajes", "Comidas"],
    targetCurrency: "MXN",
    targetSymbol: "$",
    sheetTab: "Gastos",
  },
  fr: {
    labels: ["Loyer", "Courses", "Logiciel", "Voyage", "Repas"],
    targetCurrency: "EUR",
    targetSymbol: "€",
    sheetTab: "Dépenses",
  },
  de: {
    labels: ["Miete", "Lebensmittel", "Software", "Reise", "Essen"],
    targetCurrency: "EUR",
    targetSymbol: "€",
    sheetTab: "Ausgaben",
  },
  it: {
    labels: ["Affitto", "Spesa", "Software", "Viaggio", "Pasti"],
    targetCurrency: "EUR",
    targetSymbol: "€",
    sheetTab: "Spese",
  },
  ja: {
    labels: ["家賃", "食料品", "ソフトウェア", "旅行", "食事"],
    targetCurrency: "JPY",
    targetSymbol: "¥",
    sheetTab: "経費",
  },
};

type Row = {
  label: string;
  original: string;
  converted: string;
};

function buildRows(data: LocaleData): Row[] {
  // Source currencies that differ from the target
  const sources: { symbol: string; code: string; amount: number; converted: number }[] = [];
  const pool = [
    { symbol: "£", code: "GBP", amount: 1250, rate: 1.27 },
    { symbol: "¥", code: "JPY", amount: 45000, rate: 0.0067 },
    { symbol: "€", code: "EUR", amount: 890, rate: 1.08 },
    { symbol: "$", code: "USD", amount: 150, rate: 1.0 },
    { symbol: "CHF", code: "CHF", amount: 420, rate: 1.13 },
    { symbol: "A$", code: "AUD", amount: 340, rate: 0.65 },
    { symbol: "C$", code: "CAD", amount: 275, rate: 0.74 },
  ];

  for (const p of pool) {
    if (p.code === data.targetCurrency) continue;
    sources.push({ ...p, converted: 0 });
    if (sources.length === 5) break;
  }

  // Compute fake "converted" amounts in target currency
  // Using rough USD-based cross rates for realism
  const usdRates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149,
    CHF: 0.88,
    AUD: 1.53,
    CAD: 1.36,
    MXN: 17.2,
  };

  const targetRate = usdRates[data.targetCurrency] ?? 1;

  return sources.map((s, i) => {
    const usdValue = s.amount / (usdRates[s.code] ?? 1);
    const convertedAmount = usdValue * targetRate;

    const fmtOriginal = formatCurrency(s.amount, s.symbol, s.code);
    const fmtConverted = formatCurrency(
      Math.round(convertedAmount * 100) / 100,
      data.targetSymbol,
      data.targetCurrency
    );

    return {
      label: data.labels[i],
      original: fmtOriginal,
      converted: fmtConverted,
    };
  });
}

function formatCurrency(amount: number, symbol: string, code: string): string {
  // JPY doesn't use decimals
  if (code === "JPY") {
    return `${symbol}${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  // Multi-char symbols (CHF, A$, C$) go before with a space
  if (symbol.length > 1) {
    return `${symbol} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Animation phases:
// "idle"       - show original values, pause before starting
// "selecting"  - blue highlight on current row
// "converted"  - show converted value with green flash
// "done"       - all converted, pause before reset
type Phase = "idle" | "selecting" | "converted" | "done";

export default function HomepageDemo({ locale }: { locale: string }) {
  const data = localeData[locale] ?? localeData.en;
  const rows = buildRows(data);

  const [phase, setPhase] = useState<Phase>("idle");
  const [activeRow, setActiveRow] = useState(-1);
  // Track which rows have been converted
  const [convertedRows, setConvertedRows] = useState<Set<number>>(new Set());

  const reset = useCallback(() => {
    setPhase("idle");
    setActiveRow(-1);
    setConvertedRows(new Set());
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "idle") {
      // Wait, then start selecting row 0
      timeout = setTimeout(() => {
        setActiveRow(0);
        setPhase("selecting");
      }, 1500);
    } else if (phase === "selecting") {
      // After a beat, convert the active row
      timeout = setTimeout(() => {
        setConvertedRows((prev) => new Set(prev).add(activeRow));
        setPhase("converted");
      }, 800);
    } else if (phase === "converted") {
      // Move to next row or finish
      timeout = setTimeout(() => {
        const next = activeRow + 1;
        if (next < rows.length) {
          setActiveRow(next);
          setPhase("selecting");
        } else {
          setPhase("done");
        }
      }, 600);
    } else if (phase === "done") {
      // Pause then reset
      timeout = setTimeout(reset, 2500);
    }

    return () => clearTimeout(timeout);
  }, [phase, activeRow, rows.length, reset]);

  return (
    <div className="w-full max-w-md mx-auto md:mx-0">
      <div className="bg-white rounded-xl border border-white/20 shadow-2xl shadow-black/20 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f8fafb] border-b border-[#e2e8ed]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[11px] text-[#8b95a1] font-medium tracking-wide">
            {data.sheetTab}
          </span>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[36px_1fr_1fr] border-b border-[#e2e8ed] bg-[#f8fafb]">
          <div className="border-r border-[#e2e8ed] p-1.5" />
          <div className="p-1.5 text-center text-[11px] font-medium text-[#8b95a1] border-r border-[#e2e8ed]">
            A
          </div>
          <div className="p-1.5 text-center text-[11px] font-medium text-[#8b95a1]">
            B
          </div>
        </div>

        {/* Data rows */}
        {rows.map((row, i) => {
          const isSelecting = phase === "selecting" && activeRow === i;
          const isConverted = convertedRows.has(i);
          const justConverted =
            phase === "converted" && activeRow === i;

          return (
            <div
              key={i}
              className={`grid grid-cols-[36px_1fr_1fr] border-b border-[#e2e8ed] transition-colors duration-200 ${
                isSelecting ? "bg-[#e8f0fe]" : ""
              } ${justConverted ? "homepage-demo-flash" : ""}`}
            >
              {/* Row number */}
              <div className="border-r border-[#e2e8ed] p-2 text-center text-[11px] text-[#8b95a1] bg-[#f8fafb]">
                {i + 1}
              </div>
              {/* Label */}
              <div className="p-2 px-3 text-[13px] text-[#1a1a1a] border-r border-[#e2e8ed]">
                {row.label}
              </div>
              {/* Value */}
              <div
                className={`p-2 px-3 font-mono text-[13px] text-right transition-all duration-300 ${
                  isSelecting
                    ? "ring-2 ring-[#1a73e8] ring-inset text-[#1a1a1a]"
                    : isConverted
                      ? "text-[#0d7c66] font-medium"
                      : "text-[#1a1a1a]"
                }`}
              >
                {isConverted ? row.converted : row.original}
              </div>
            </div>
          );
        })}

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#f8fafb] border-t border-[#e2e8ed]">
          <span className="text-[11px] text-[#8b95a1]">
            {phase === "done"
              ? `${data.targetCurrency} ✓`
              : phase === "selecting" || phase === "converted"
                ? `→ ${data.targetCurrency}`
                : ""}
          </span>
          <div className="flex gap-1.5">
            {rows.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  convertedRows.has(i)
                    ? "bg-[#0d7c66]"
                    : phase === "selecting" && activeRow === i
                      ? "bg-[#1a73e8]"
                      : "bg-[#d5dbe1]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
