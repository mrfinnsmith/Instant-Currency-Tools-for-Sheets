import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Send email via Resend, or fall back to a simple notification.
    // For now, we'll use the Resend API if configured, otherwise log it.
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Instant Currency <noreply@instantcurrency.tools>",
          to: "hi@instantcurrency.tools",
          subject: `Contact form: ${name}`,
          reply_to: email,
          text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Resend error:", errorData);
        return NextResponse.json(
          { error: "Failed to send message" },
          { status: 500 }
        );
      }
    } else {
      // Log to console when Resend isn't configured (development)
      console.log("Contact form submission:", { name, email, message });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
