import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { contact_id } = body;

  let roomUrl = "";
  let roomName = "";

  // Create Daily.co room via API
  if (process.env.DAILY_API_KEY) {
    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          enable_recording: "cloud",
          max_participants: 10,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // 2 hours
        },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      roomUrl = data.url;
      roomName = data.name;
    }
  }

  if (!roomUrl) {
    // Fallback: generate a unique room name
    roomName = `crm-${user.id.slice(0, 8)}-${Date.now()}`;
    roomUrl = `https://yourapp.daily.co/${roomName}`;
  }

  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert({
      user_id: user.id,
      contact_id: contact_id ?? null,
      daily_room_url: roomUrl,
      daily_room_name: roomName,
      status: "active",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ room_url: roomUrl, meeting_id: meeting.id });
}
