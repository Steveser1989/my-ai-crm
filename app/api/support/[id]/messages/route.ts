import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await request.json();
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  // Check if admin
  const { data: profileData } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).single();
  const profile = profileData as { is_admin: boolean } | null;
  const isAdmin = profile?.is_admin === true;

  const service = await createServiceClient();
  const { data: ticketData } = await service
    .from("support_tickets")
    .select("id, user_id")
    .eq("id", id)
    .single();

  const ticket = ticketData as { id: string; user_id: string } | null;
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isAdmin && ticket.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await service
    .from("support_ticket_messages")
    .insert({
      ticket_id: id,
      sender_id: user.id,
      is_admin: isAdmin,
      message,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (isAdmin) {
    await service
      .from("support_tickets")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "open");
  }

  return NextResponse.json({ message: data }, { status: 201 });
}
