import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profileData } = await supabase.from("user_profiles").select("is_admin").eq("id", user.id).single();
  const profile = profileData as { is_admin: boolean } | null;
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { user_id, amount } = await request.json();
  if (!user_id || typeof amount !== "number") {
    return NextResponse.json({ error: "user_id and amount required" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { error } = await service.from("credit_ledger").insert({
    user_id,
    amount,
    credit_type: "admin_adjustment",
    description: `Admin adjustment: ${amount > 0 ? "+" : ""}${amount} credits by ${user.id.slice(0, 8)}`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
