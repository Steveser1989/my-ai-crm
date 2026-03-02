import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    { data: subscription },
    { data: creditBalance },
    { data: usageHistory },
  ] = await Promise.all([
    supabase
      .from("user_subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("credit_balance")
      .select("balance")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("credit_ledger")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // Calculate sub vs topup balance separately
  const { data: ledgerRows } = await supabase
    .from("credit_ledger")
    .select("amount, credit_type")
    .eq("user_id", user.id);

  const subBalance = (ledgerRows ?? [])
    .filter((r) => r.credit_type === "subscription_grant" || r.credit_type === "subscription_reset")
    .reduce((s, r) => s + r.amount, 0);

  const topupBalance = (ledgerRows ?? [])
    .filter((r) => r.credit_type === "topup")
    .reduce((s, r) => s + r.amount, 0);

  const usageDeducted = (ledgerRows ?? [])
    .filter((r) => r.credit_type === "api_usage")
    .reduce((s, r) => s + r.amount, 0);

  return NextResponse.json({
    subscription,
    total_balance: creditBalance?.balance ?? 0,
    sub_balance: Math.max(0, subBalance + usageDeducted),
    topup_balance: Math.max(0, topupBalance),
    usage_history: usageHistory ?? [],
  });
}
