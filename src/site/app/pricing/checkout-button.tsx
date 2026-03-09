"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="mt-8 block w-full rounded-lg bg-teal py-2.5 text-center text-[14px] font-500 text-white shadow-sm shadow-teal/20 hover:bg-teal-dark transition-all duration-150 disabled:opacity-50"
    >
      {loading ? "Redirecting..." : "Upgrade to Pro"}
    </button>
  );
}
