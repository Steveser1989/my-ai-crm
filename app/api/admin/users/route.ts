import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profileData } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).single();
  const profile = profileData as { is_admin: boolean } | null;
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { user_id, is_admin } = await request.json();
  const service = await createServiceClient();
  const { error } = await service.from("user_profiles").update({ is_admin }).eq("id", user_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
