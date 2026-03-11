"use client";

import { useState, type FormEvent } from "react";

interface ContactFormLabels {
  name: string;
  email: string;
  message: string;
  send: string;
  sending: string;
  error: string;
  sentTitle: string;
  sentBody: string;
}

export function ContactForm({
  locale,
  labels,
}: {
  locale: string;
  labels: ContactFormLabels;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      locale,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-teal/20 bg-teal-light p-8">
        <p className="text-[15px] font-600 text-fg">{labels.sentTitle}</p>
        <p className="mt-2 text-[14px] text-muted">{labels.sentBody}</p>
      </div>
    );
  }

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-rule bg-bg px-4 py-2.5 text-[14px] text-fg placeholder:text-faint focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="text-[14px] font-500 text-fg">{labels.name}</label>
        <input type="text" id="name" name="name" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className="text-[14px] font-500 text-fg">{labels.email}</label>
        <input type="email" id="email" name="email" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="message" className="text-[14px] font-500 text-fg">{labels.message}</label>
        <textarea id="message" name="message" required rows={5} className={`${inputClass} resize-none`} />
      </div>

      {status === "error" && (
        <p className="text-[13px] text-red-600">{labels.error}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-lg bg-teal px-6 py-2.5 text-[14px] font-500 text-white shadow-sm shadow-teal/20 hover:bg-teal-dark transition-all duration-150 disabled:opacity-50"
      >
        {status === "sending" ? labels.sending : labels.send}
      </button>
    </form>
  );
}
