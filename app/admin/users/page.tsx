import { createServiceClient } from "@/lib/supabase/server";
import { AdminUsersClient } from "@/modules/admin/views/AdminUsersView";

type UserRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
};

type SubscriptionRow = {
  user_id: string;
  status: string;
  plan_id: string | null;
  current_period_end: string | null;
};

type BalanceRow = {
  user_id: string;
  balance: number;
};

export default async function AdminUsersPage() {
  const supabase = await createServiceClient();

  const [
    { data: userRows },
    { data: subscriptionRows },
    { data: balanceRows },
  ] = await Promise.all([
    supabase.from("user_profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_subscriptions").select("user_id, status, plan_id, current_period_end"),
    supabase.from("credit_balance").select("user_id, balance"),
  ]);

  const users = (userRows ?? []) as UserRow[];
  const subscriptions = (subscriptionRows ?? []) as SubscriptionRow[];
  const balances = (balanceRows ?? []) as BalanceRow[];

  const usersWithData = users.map((u) => ({
    ...u,
    subscription: subscriptions.find((s) => s.user_id === u.id) ?? null,
    balance: balances.find((b) => b.user_id === u.id)?.balance ?? 0,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Users ({usersWithData.length})</h1>
      <AdminUsersClient users={usersWithData} />
    </div>
  );
}
