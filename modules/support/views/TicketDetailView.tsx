"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  is_admin: boolean;
  message: string;
  created_at: string;
}

export function TicketThreadClient({
  ticketId,
  initialMessages,
  userId,
}: {
  ticketId: string;
  initialMessages: Message[];
  userId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    const res = await fetch(`/api/support/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply }),
    });
    setSending(false);
    if (!res.ok) { toast.error("Failed to send message"); return; }
    const data = await res.json();
    const msg = data.message ?? data;
    setMessages((prev) => [...prev, msg]);
    setReply("");
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700">Conversation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No messages yet. We&apos;ll respond soon.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
              >
                {msg.sender_id !== userId && (
                  <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.sender_id === userId ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  {msg.is_admin && <span className="text-xs text-indigo-600 font-medium">Support Team</span>}
                  <div className={`rounded-2xl px-4 py-3 text-sm ${
                    msg.sender_id === userId
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-slate-100 text-slate-800 rounded-tl-sm"
                  }`}>
                    {msg.message}
                  </div>
                  <span className="text-xs text-slate-400">
                    {format(new Date(msg.created_at), "MMM d, HH:mm")}
                  </span>
                </div>
                {msg.sender_id === userId && (
                  <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <Textarea
            rows={2}
            placeholder="Write a reply..."
            className="flex-1 resize-none text-sm"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
            }}
          />
          <Button onClick={sendReply} disabled={sending || !reply.trim()} className="bg-indigo-600 hover:bg-indigo-700 h-auto w-10">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
