import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Package, MessageSquare, TrendingUp, Activity, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getDashboardStats(userId: string) {
  const supabase = await createClient();
  const [
    { count: contactCount },
    { count: productCount },
    { count: dealCount },
    { count: activityCount },
    { count: commCount },
    { data: recentActivities },
    { data: openDeals },
  ] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("deals").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "open"),
    supabase.from("activities").select("*", { count: "exact", head: true }).eq("user_id", userId).is("completed_at", null),
    supabase.from("communications").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("activities").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("deals").select("*, contacts(name), pipeline_stages(name)").eq("user_id", userId).eq("status", "open").order("created_at", { ascending: false }).limit(5),
  ]);

  return { contactCount, productCount, dealCount, activityCount, commCount, recentActivities, openDeals };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const stats = await getDashboardStats(user.id);

  const kpiCards = [
    { title: "Total Contacts", value: stats.contactCount ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Products", value: stats.productCount ?? 0, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Open Deals", value: stats.dealCount ?? 0, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { title: "Pending Tasks", value: stats.activityCount ?? 0, icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Messages", value: stats.commCount ?? 0, icon: MessageSquare, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here&apos;s your overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="border-slate-200">
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg ${kpi.bg} mb-3`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{kpi.value.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">{kpi.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{act.title}</p>
                      <p className="text-xs text-slate-400">{act.type} · {new Date(act.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No recent activities</p>
            )}
          </CardContent>
        </Card>

        {/* Open Deals */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Open Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.openDeals && stats.openDeals.length > 0 ? (
              <div className="space-y-3">
                {stats.openDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{deal.title}</p>
                      <p className="text-xs text-slate-400">
                        {(deal.contacts as {name: string} | null)?.name ?? "No contact"} ·{" "}
                        {(deal.pipeline_stages as {name: string} | null)?.name ?? ""}
                      </p>
                    </div>
                    {deal.value && (
                      <span className="text-sm font-semibold text-green-600">
                        {deal.currency} {Number(deal.value).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No open deals</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
