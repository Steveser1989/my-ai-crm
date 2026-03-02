import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TicketIcon, Circle } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-600",
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-slate-100 text-slate-600",
  low: "bg-slate-50 text-slate-400",
};

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support</h1>
          <p className="text-slate-500 text-sm mt-1">Submit and track your support tickets</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="/dashboard/support/new">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Link>
        </Button>
      </div>

      {tickets && tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/dashboard/support/${ticket.id}`}>
              <Card className="border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <TicketIcon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900">{ticket.title}</p>
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{ticket.description}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {format(new Date(ticket.created_at), "MMM d, yyyy")} · {ticket.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`text-xs ${PRIORITY_COLORS[ticket.priority] ?? ""}`}>{ticket.priority}</Badge>
                      <Badge className={`text-xs ${STATUS_COLORS[ticket.status] ?? ""}`}>{ticket.status.replace("_", " ")}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <TicketIcon className="h-12 w-12 mx-auto text-slate-200 mb-3" />
            <p className="font-medium text-slate-700">No support tickets</p>
            <p className="text-sm text-slate-400 mt-1">Create your first ticket if you need help</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
