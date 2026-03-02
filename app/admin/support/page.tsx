import { createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";

export default async function AdminSupportPage() {
  const supabase = await createServiceClient();

  const { data: ticketRows } = await supabase
    .from("support_tickets")
    .select("id, user_id, title, status, priority, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  type TicketRow = { id: string; user_id: string; title: string; status: string; priority: string; created_at: string };
  const tickets = (ticketRows ?? []) as TicketRow[];

  const statusColor: Record<string, string> = {
    open: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Support Tickets</h1>

      <div className="grid grid-cols-4 gap-4">
        {(["open", "in_progress", "resolved", "closed"] as const).map((s) => {
          const count = (tickets ?? []).filter((t) => t.status === s).length;
          return (
            <Card key={s} className="border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 capitalize">{s.replace("_", " ")}</p>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><LifeBuoy className="h-4 w-4" />All Tickets</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(tickets ?? []).map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link href={`/admin/support/${t.id}`} className="text-indigo-600 hover:underline text-sm font-medium">
                      {t.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{t.user_id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[t.status] ?? ""}`}>
                      {t.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{t.priority}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{format(new Date(t.created_at), "MMM d, HH:mm")}</TableCell>
                </TableRow>
              ))}
              {(tickets ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-8">No tickets yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
