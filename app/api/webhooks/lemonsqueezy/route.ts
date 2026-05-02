import Stripe from "stripe";
import { NextResponse } from "next/server";
import { addEntitlement } from "@/lib/database";
import { getCheckoutProviderLabel, initLemonSqueezy } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");

export async function POST(request: Request) {
  initLemonSqueezy();

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Missing webhook configuration." }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email ?? session.customer_email;

    if (email) {
      await addEntitlement(email, "stripe");
    }
  }

  return NextResponse.json({ received: true, provider: getCheckoutProviderLabel() });
}
