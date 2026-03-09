import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Instant Currency team.",
};

export default function Contact() {
  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <section className="pt-16 pb-6 md:pt-24">
        <p className="text-teal text-[13px] font-600 tracking-wide uppercase">Contact</p>
        <h1 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-700 text-fg md:text-4xl">
          Get in touch
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-muted max-w-lg">
          Have a question, bug report, or feature request? Send us a message
          and we&apos;ll get back to you.
        </p>
      </section>
      <section className="pb-20 max-w-md">
        <ContactForm />
      </section>
    </div>
  );
}
