import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { grantCredits, resetSubscriptionCredits } from "@/lib/credits/balance";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sub = event.data.object as any;
      const customerId = sub.customer as string;
      const { data: profile } = await supabase
        .from("user_subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile?.user_id) {
        await supabase.from("user_subscriptions").upsert({
          user_id: profile.user_id,
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          plan_id: "monthly_49",
          status: sub.status,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
        }, { onConflict: "user_id" });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason !== "subscription_cycle" && invoice.billing_reason !== "subscription_create") break;

      const customerId = invoice.customer as string;
      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (sub?.user_id) {
        // Reset unused monthly credits, then grant fresh 100k
        await resetSubscriptionCredits(sub.user_id);
        await grantCredits(sub.user_id, 100000, "subscription_grant", event.id, "Monthly subscription: 100,000 credits");
      }
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.type === "topup") {
        const userId = session.metadata?.user_id;
        if (userId) {
          await grantCredits(userId, 50000, "topup", event.id, "Top-up purchase: 50,000 credits (never expire)");
        }
      } else if (session.mode === "subscription") {
        // Update customer ID in subscription record
        const customerId = session.customer as string;
        const userId = session.metadata?.user_id;
        if (userId && customerId) {
          await supabase.from("user_subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: customerId,
          }, { onConflict: "user_id" });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sub = event.data.object as any;
      const customerId = sub.customer as string;
      await supabase
        .from("user_subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
