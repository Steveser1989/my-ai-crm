import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketThreadClient } from "@/modules/support/views/TicketDetailView";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-600",
};

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!ticket) notFound();

  const { data: messages } = await supabase
    .from("support_ticket_messages")
    .select("*")
    .eq("ticket_id", id)
    .order("created_at");

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/support"><ArrowLeft className="h-4 w-4 mr-1" />Support</Link>
        </Button>
        <h1 className="text-xl font-bold text-slate-900 flex-1">{ticket.title}</h1>
        <Badge className={`text-xs ${STATUS_COLORS[ticket.status] ?? ""}`}>{ticket.status.replace("_", " ")}</Badge>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
          {ticket.screenshot_url && (
            <img src={ticket.screenshot_url} alt="Screenshot" className="mt-3 h-40 rounded-lg border border-slate-200 object-cover" />
          )}
          <p className="text-xs text-slate-400 mt-3">
            {ticket.category} · {format(new Date(ticket.created_at), "MMM d, yyyy")}
          </p>
        </CardContent>
      </Card>

      <TicketThreadClient ticketId={id} initialMessages={messages ?? []} userId={user.id} />
    </div>
  );
}
