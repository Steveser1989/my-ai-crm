import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let customerId = sub?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID_TOPUP!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}&type=topup`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    metadata: { user_id: user.id, type: "topup" },
  });

  return NextResponse.json({ url: session.url });
}
