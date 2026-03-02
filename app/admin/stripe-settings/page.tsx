import { stripe } from "@/lib/stripe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CreditCard, Webhook, DollarSign } from "lucide-react";

export default async function StripeSettingsPage() {
  let account: { id: string; email: string | null; charges_enabled: boolean; payouts_enabled: boolean; } | null = null;
  let plans: Array<{ id: string; nickname: string | null; unit_amount: number | null; currency: string; interval: string; active: boolean }> = [];

  try {
    const acc = await stripe.accounts.retrieve();
    account = {
      id: acc.id,
      email: acc.email ?? null,
      charges_enabled: acc.charges_enabled ?? false,
      payouts_enabled: acc.payouts_enabled ?? false,
    };
  } catch (_) {}

  try {
    const prices = await stripe.prices.list({ limit: 10, active: true });
    plans = prices.data.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      unit_amount: p.unit_amount,
      currency: p.currency,
      interval: (p.recurring?.interval) ?? "one_time",
      active: p.active,
    }));
  } catch (_) {}

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold text-slate-900">Stripe Settings</h1>

      {/* Account Status */}
      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" />Account Status</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {account ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Account ID</span>
                <span className="font-mono text-xs">{account.id}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Email</span>
                <span>{account.email ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Charges Enabled</span>
                <Badge className={account.charges_enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {account.charges_enabled ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Payouts Enabled</span>
                <Badge className={account.payouts_enabled ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                  {account.payouts_enabled ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Unable to load Stripe account. Check your STRIPE_SECRET_KEY.</p>
          )}
        </CardContent>
      </Card>

      {/* Active Prices/Plans */}
      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" />Active Prices</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {plans.length === 0 ? (
            <p className="text-sm text-slate-400">No active prices found.</p>
          ) : (
            <div className="space-y-2">
              {plans.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                  <div>
                    <span className="font-medium">{p.nickname ?? "Unnamed"}</span>
                    <span className="text-xs text-slate-400 ml-2 font-mono">{p.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700">${((p.unit_amount ?? 0) / 100).toFixed(2)} / {p.interval}</span>
                    <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Info */}
      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Webhook className="h-4 w-4" />Webhook Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Endpoint URL</span>
            <code className="text-xs bg-slate-100 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Events to listen</span>
            <div className="flex flex-wrap gap-1 justify-end max-w-xs">
              {["customer.subscription.created", "invoice.payment_succeeded", "checkout.session.completed"].map((e) => (
                <code key={e} className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{e}</code>
              ))}
            </div>
          </div>
          <a
            href="https://dashboard.stripe.com/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-xs"
          >
            Open Stripe Dashboard <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
