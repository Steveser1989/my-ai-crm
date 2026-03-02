import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AdminTicketDetail from "@/modules/admin/views/AdminTicketDetailView";

interface AdminTicketPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTicketPage({ params }: AdminTicketPageProps) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("*, support_ticket_messages(*)")
    .eq("id", id)
    .single();

  if (!ticket) return notFound();

  return <AdminTicketDetail ticket={ticket as Parameters<typeof AdminTicketDetail>[0]["ticket"]} />;
}
