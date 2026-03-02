import { createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, MessageSquare, TrendingUp, DollarSign, Zap, TicketIcon } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createServiceClient();

  const [
    { count: totalUsers },
    { count: totalContacts },
    { count: totalComms },
    { count: openTickets },
    { data: tokenRows },
    { data: subStats },
  ] = await Promise.all([
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("communications").select("*", { count: "exact", head: true }),
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("credit_ledger").select("tokens_used, amount").eq("credit_type", "api_usage"),
    supabase.from("user_subscriptions").select("status").eq("status", "active"),
  ]);

  const tokenData = (tokenRows ?? []) as Array<{ tokens_used: number | null; amount: number | null }>;
  const totalTokens = tokenData.reduce((s, r) => s + (r.tokens_used ?? 0), 0);
  const activeSubscriptions = subStats?.length ?? 0;
  const monthlyRevenue = activeSubscriptions * 49;

  const kpis = [
    { label: "Total Users", value: totalUsers ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Contacts", value: totalContacts ?? 0, icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: "Conversations", value: totalComms ?? 0, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Open Tickets", value: openTickets ?? 0, icon: TicketIcon, color: "text-red-600", bg: "bg-red-50" },
    { label: "Active Subscriptions", value: activeSubscriptions, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Monthly Revenue", value: `$${monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Tokens Used", value: totalTokens.toLocaleString(), icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Platform Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-slate-200">
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg ${kpi.bg} mb-3`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
              <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
