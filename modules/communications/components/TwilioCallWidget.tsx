"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, PhoneCall, Loader2, Mic, MicOff, Info } from "lucide-react";
import { toast } from "sonner";

export function TwilioCallWidget() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "ended">("idle");
  const [muted, setMuted] = useState(false);
  const [callSid, setCallSid] = useState<string | null>(null);

  async function startCall() {
    if (!phoneNumber.trim()) { toast.error("Enter a phone number"); return; }
    setCallStatus("connecting");

    const res = await fetch("/api/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: phoneNumber }),
    });

    if (!res.ok) {
      toast.error("Call failed to connect");
      setCallStatus("idle");
      return;
    }

    const data = await res.json();
    setCallSid(data.call_sid);
    setCallStatus("active");
    toast.success("Call connected!");
  }

  async function endCall() {
    if (callSid) {
      await fetch(`/api/calls/${callSid}/end`, { method: "POST" }).catch(console.error);
    }
    setCallStatus("ended");
    toast.info("Call ended");
  }

  return (
    <Card className="border-slate-200 max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Phone className="h-4 w-4 text-green-600" />
          Twilio Phone Call
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Banner */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_TWIML_APP_SID in your .env file.
            Calls are recorded and transcribed automatically.
          </p>
        </div>

        {callStatus === "idle" || callStatus === "ended" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="+1 555 000 0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={startCall}
            >
              <Phone className="h-4 w-4 mr-2" />
              {callStatus === "ended" ? "Call Again" : "Start Call"}
            </Button>
            {callStatus === "ended" && (
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-600">Call ended</Badge>
                <span className="text-xs text-slate-400">Transcript saved to contact profile</span>
              </div>
            )}
          </div>
        ) : callStatus === "connecting" ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <p className="text-sm text-slate-600">Connecting to {phoneNumber}...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                <PhoneCall className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900">{phoneNumber}</p>
                <Badge className="bg-green-100 text-green-700 mt-1">Active Call</Badge>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 rounded-full ${muted ? "bg-red-100 border-red-300" : ""}`}
                onClick={() => setMuted(!muted)}
              >
                {muted ? <MicOff className="h-5 w-5 text-red-600" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600"
                onClick={endCall}
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
