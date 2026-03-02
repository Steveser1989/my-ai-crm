import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phone_number, contact_id } = await request.json();
  if (!phone_number) return NextResponse.json({ error: "phone_number required" }, { status: 400 });

  let callSid = `SIMULATED_${Date.now()}`;

  // Initiate Twilio call if credentials are available
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = await import("twilio").then((m) => m.default ?? m);
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    try {
      const call = await client.calls.create({
        to: phone_number,
        from: process.env.TWILIO_PHONE_NUMBER!,
        twiml: `<Response><Say>Connecting you now from My AI CRM.</Say><Pause length="1"/></Response>`,
        record: true,
      });
      callSid = call.sid;
    } catch (err) {
      console.error("Twilio call error:", err);
    }
  }

  const { data: callRecord, error } = await supabase
    .from("calls")
    .insert({
      user_id: user.id,
      contact_id: contact_id ?? null,
      twilio_call_sid: callSid,
      phone_number,
      direction: "outbound",
      status: "initiated",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ call_sid: callSid, call_id: callRecord.id });
}
