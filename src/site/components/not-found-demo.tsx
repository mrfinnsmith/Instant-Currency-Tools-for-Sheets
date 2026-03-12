"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function NotFoundDemo() {
  const t = useTranslations("notFound.demo");

  const steps = [
    { cell: "$100.00", label: t("step1") },
    { cell: "...", label: t("step2") },
    { cell: "\u20ac404.00", label: t("step3") },
  ];

  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-72 mx-auto">
      <div className="bg-white rounded-xl border border-rule shadow-lg shadow-teal/5 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border-b border-rule">
          <div className="w-2.5 h-2.5 rounded-full bg-teal/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#e8c94a]/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#7ab87a]/40" />
          <span className="ml-2 text-xs text-faint font-medium">
            {t("sheetTab")}
          </span>
        </div>

        {/* Column header */}
        <div className="grid grid-cols-[44px_1fr] border-b border-rule bg-surface">
          <div className="border-r border-rule p-1.5" />
          <div className="p-1.5 text-center text-xs font-medium text-faint">
            A
          </div>
        </div>

        {/* Data row */}
        <div key={step} className="grid grid-cols-[44px_1fr] animate-fade-up">
          <div className="border-r border-rule p-2 text-center text-xs text-faint bg-surface">
            1
          </div>
          <div
            className={`p-2.5 font-mono text-sm ${
              step === 2 ? "text-teal-dark font-medium" : "text-fg"
            }`}
          >
            {steps[step].cell}
          </div>
        </div>

        {/* Empty rows */}
        {[2, 3].map((n) => (
          <div
            key={n}
            className="grid grid-cols-[44px_1fr] border-t border-rule"
          >
            <div className="border-r border-rule p-2 text-center text-xs text-faint bg-surface">
              {n}
            </div>
            <div className="p-2.5" />
          </div>
        ))}

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-rule">
          <span className="text-xs text-faint">{steps[step].label}</span>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  i === step ? "bg-teal" : "bg-rule"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
