import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_creation: "always",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
