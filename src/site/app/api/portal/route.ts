import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    const stripe = getStripe();
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      // Redirect to pricing page if no email provided
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`
      );
    }

    // Find customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });

    if (customers.data.length === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?error=no-subscription`
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    });

    return NextResponse.redirect(portalSession.url);
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`
    );
  }
}
