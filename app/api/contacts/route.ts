import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingestContactChunk } from "@/lib/rag/search";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  let query = supabase
    .from("contacts")
    .select("*, contact_social_handles(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { social_handles, ...contactData } = body;

  const { data: contact, error } = await supabase
    .from("contacts")
    .insert({ ...contactData, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert social handles
  if (social_handles && social_handles.length > 0) {
    await supabase.from("contact_social_handles").insert(
      social_handles.map((h: { platform: string; handle: string }) => ({
        contact_id: contact.id,
        platform: h.platform,
        handle: h.handle,
      }))
    );
  }

  // Ingest contact info into RAG
  const ragContent = [
    `Contact: ${contact.name}`,
    contact.company ? `Company: ${contact.company}` : "",
    contact.email ? `Email: ${contact.email}` : "",
    contact.phone ? `Phone: ${contact.phone}` : "",
    contact.title ? `Title: ${contact.title}` : "",
    contact.notes ? `Notes: ${contact.notes}` : "",
  ].filter(Boolean).join("\n");

  await ingestContactChunk(contact.id, ragContent, { source: "contact_profile" }).catch(console.error);

  return NextResponse.json(contact, { status: 201 });
}
