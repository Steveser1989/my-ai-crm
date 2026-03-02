"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Zap, CreditCard, Plus, ExternalLink, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface BillingStatus {
  subscription: {
    status: string;
    current_period_end: string | null;
    plan_id: string | null;
    subscription_plans: { name: string; price_usd: number; credits: number } | null;
  } | null;
  total_balance: number;
  sub_balance: number;
  topup_balance: number;
  usage_history: Array<{
    id: string;
    amount: number;
    credit_type: string;
    model: string | null;
    tokens_used: number | null;
    description: string | null;
    created_at: string;
  }>;
}

export default function BillingPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => toast.error("Failed to load billing info"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubscribe() {
    setActionLoading("subscribe");
    const res = await fetch("/api/billing/subscribe", { method: "POST" });
    const data = await res.json();
    setActionLoading(null);
    if (data.url) window.location.href = data.url;
    else toast.error("Failed to create checkout session");
  }

  async function handleTopup() {
    setActionLoading("topup");
    const res = await fetch("/api/billing/topup", { method: "POST" });
    const data = await res.json();
    setActionLoading(null);
    if (data.url) window.location.href = data.url;
    else toast.error("Failed to create top-up session");
  }

  async function handlePortal() {
    setActionLoading("portal");
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    setActionLoading(null);
    if (data.url) window.location.href = data.url;
    else toast.error("No billing account found. Subscribe first.");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isActive = status?.subscription?.status === "active";
  const subProgress = status ? Math.min(100, ((status.sub_balance) / 100000) * 100) : 0;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing & Credits</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your subscription and AI credits</p>
      </div>

      {/* Credit Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Credits Card */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Monthly Credits</CardTitle>
              <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-100 text-green-700" : ""}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <CardDescription>Resets at each billing renewal · unused credits expire</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900">{(status?.sub_balance ?? 0).toLocaleString()}</span>
              <span className="text-slate-500 text-sm mb-1">/ 100,000</span>
            </div>
            <Progress value={subProgress} className="h-2" />
            {status?.subscription?.current_period_end && (
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Renews {format(new Date(status.subscription.current_period_end), "MMM d, yyyy")}
              </p>
            )}
            {isActive ? (
              <Button variant="outline" size="sm" className="w-full" onClick={handlePortal} disabled={actionLoading === "portal"}>
                {actionLoading === "portal" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                Manage Subscription
              </Button>
            ) : (
              <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSubscribe} disabled={actionLoading === "subscribe"}>
                {actionLoading === "subscribe" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                Subscribe — $49/month
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Top-up Credits Card */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Top-up Credits</CardTitle>
            <CardDescription>Never expire · carry over indefinitely</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <Zap className="h-6 w-6 text-amber-500 mb-1" />
              <span className="text-3xl font-bold text-slate-900">{(status?.topup_balance ?? 0).toLocaleString()}</span>
              <span className="text-slate-500 text-sm mb-1">credits</span>
            </div>
            <p className="text-xs text-slate-400">Top-up credits are used after your monthly credits are exhausted.</p>
            <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white" onClick={handleTopup} disabled={actionLoading === "topup"}>
              {actionLoading === "topup" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Top Up — $20 / 50,000 credits
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Info */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-700 mb-3">Credit Usage Rates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: "GPT-4o Chat", value: "1 credit / token" },
              { label: "GPT-4o Vision/OCR", value: "1 credit / token" },
              { label: "RAG Embedding", value: "1 credit / token" },
              { label: "Whisper Audio", value: "100 credits / min" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-slate-500 text-xs">{item.label}</p>
                <p className="font-semibold text-slate-800 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage History */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Usage History</CardTitle>
        </CardHeader>
        <CardContent>
          {status?.usage_history && status.usage_history.length > 0 ? (
            <div className="space-y-2">
              {status.usage_history.map((row) => (
                <div key={row.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {row.description ?? row.credit_type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-slate-400">
                      {row.model ?? ""} · {format(new Date(row.created_at), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${row.amount > 0 ? "text-green-600" : "text-slate-600"}`}>
                    {row.amount > 0 ? "+" : ""}{row.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No usage history yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
