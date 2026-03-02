"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | "single">("all");
  const [userId, setUserId] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    toast.success(`Notification sent to ${target === "all" ? "all users" : userId}`);
    setTitle("");
    setMessage("");
    setUserId("");
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Send Notifications</h1>
      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />Compose Notification</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {(["all", "single"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTarget(t)}
                className={`px-4 py-1.5 rounded-full text-sm border ${target === t ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600"}`}
              >
                {t === "all" ? "All Users" : "Single User"}
              </button>
            ))}
          </div>
          {target === "single" && (
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input placeholder="Enter user UUID" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="Notification title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea rows={3} placeholder="Notification body..." value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button onClick={handleSend} disabled={sending || !title || !message} className="bg-indigo-600 hover:bg-indigo-700">
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Send Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
