import { createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default async function TokenUsagePage() {
  const supabase = await createServiceClient();

  const { data: usageRows } = await supabase
    .from("credit_ledger")
    .select("user_id, model, tokens_used, amount, created_at")
    .eq("credit_type", "api_usage")
    .order("created_at", { ascending: false })
    .limit(100);

  type UsageRow = { user_id: string; model: string | null; tokens_used: number | null; amount: number | null; created_at: string };
  const usage = (usageRows ?? []) as UsageRow[];

  // Aggregate by model
  const modelStats = usage.reduce<Record<string, { count: number; tokens: number; credits: number }>>((acc, row) => {
    const model = row.model ?? "unknown";
    if (!acc[model]) acc[model] = { count: 0, tokens: 0, credits: 0 };
    acc[model].count++;
    acc[model].tokens += row.tokens_used ?? 0;
    acc[model].credits += Math.abs(row.amount ?? 0);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Token Usage</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(modelStats).map(([model, stats]) => (
          <Card key={model} className="border-slate-200">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-slate-600">{model}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.tokens.toLocaleString()}</p>
              <p className="text-xs text-slate-400">{stats.count} calls · {stats.credits.toLocaleString()} credits</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Table */}
      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base">Recent Usage</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Credits Deducted</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usage.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs text-slate-500">{row.user_id.slice(0, 8)}...</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{row.model ?? "—"}</Badge></TableCell>
                  <TableCell className="text-sm">{(row.tokens_used ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-red-600">{row.amount}</TableCell>
                  <TableCell className="text-xs text-slate-500">{format(new Date(row.created_at), "MMM d, HH:mm")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
