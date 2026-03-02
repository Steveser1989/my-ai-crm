import { createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users2, DollarSign, TrendingUp } from "lucide-react";

export default async function AffiliatesPage() {
  const supabase = await createServiceClient();

  const { count: userCount } = await supabase.from("user_profiles").select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Affiliates</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users2 className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="text-xs text-slate-500">Total Affiliates</p>
                <p className="text-2xl font-bold text-slate-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-xs text-slate-500">Total Commission Paid</p>
                <p className="text-2xl font-bold text-slate-900">$0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-xs text-slate-500">Referred Users</p>
                <p className="text-2xl font-bold text-slate-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base">Affiliate Program</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-400">
            <Users2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Affiliate program coming soon</p>
            <p className="text-sm mt-1">Connect with a referral platform like Rewardful or PartnerStack to manage affiliates.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
