import { createServiceClient } from "@/lib/supabase/server";
import type { CreditType } from "./types";

export async function getCreditBalance(userId: string): Promise<number> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("credit_balance")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error) return 0;
  return data?.balance ?? 0;
}

export async function getUserProfile(userId: string) {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return data ?? { is_admin: false };
}

export async function deductCredits(
  userId: string,
  credits: number,
  model: string,
  tokensUsed: number,
  openaiRequestId?: string
): Promise<void> {
  const supabase = await createServiceClient();
  await supabase.from("credit_ledger").insert({
    user_id: userId,
    amount: -credits,
    credit_type: "api_usage" as CreditType,
    model,
    tokens_used: tokensUsed,
    openai_request_id: openaiRequestId ?? null,
    description: `${model} usage: ${tokensUsed} tokens`,
  });
}

export async function grantCredits(
  userId: string,
  amount: number,
  creditType: CreditType,
  stripeEventId?: string,
  description?: string
): Promise<void> {
  const supabase = await createServiceClient();
  await supabase.from("credit_ledger").insert({
    user_id: userId,
    amount,
    credit_type: creditType,
    stripe_event_id: stripeEventId ?? null,
    description: description ?? `${creditType}: +${amount} credits`,
  });
}

export async function resetSubscriptionCredits(userId: string): Promise<void> {
  const supabase = await createServiceClient();

  // Calculate unused subscription credits (sum of subscription_grant + subscription_reset so far)
  const { data: rows } = await supabase
    .from("credit_ledger")
    .select("amount, credit_type")
    .eq("user_id", userId)
    .in("credit_type", ["subscription_grant", "subscription_reset", "api_usage"]);

  if (!rows) return;

  // Simple approach: sum subscription_grant + subscription_reset - api_usage (since we don't track source per usage)
  // We expire any remaining subscription credits by zeroing them out
  const subGranted = rows
    .filter((r) => r.credit_type === "subscription_grant")
    .reduce((s, r) => s + r.amount, 0);
  const subReset = rows
    .filter((r) => r.credit_type === "subscription_reset")
    .reduce((s, r) => s + r.amount, 0);
  const apiUsage = rows
    .filter((r) => r.credit_type === "api_usage")
    .reduce((s, r) => s + r.amount, 0); // negative values

  const subRemaining = subGranted + subReset + apiUsage;
  if (subRemaining > 0) {
    await supabase.from("credit_ledger").insert({
      user_id: userId,
      amount: -subRemaining,
      credit_type: "subscription_reset" as CreditType,
      description: "Monthly subscription credits expired",
    });
  }
}
