"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

interface Ticket {
  id: string;
  user_id: string;
  title: string;
  status: string;
  priority: string;
  description: string;
  created_at: string;
  support_ticket_messages: Message[];
}

export default function AdminTicketDetail({ ticket }: { ticket: Ticket }) {
  const [messages, setMessages] = useState<Message[]>(ticket.support_ticket_messages);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [sending, setSending] = useState(false);

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    const res = await fetch(`/api/support/${ticket.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply }),
    });
    setSending(false);
    if (res.ok) {
      const { message: msg } = await res.json();
      setMessages((m) => [...m, msg]);
      setReply("");
      toast.success("Reply sent");
    } else {
      toast.error("Failed to send reply");
    }
  }

  async function updateStatus(newStatus: string) {
    setStatus(newStatus);
    await fetch(`/api/support/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    toast.success("Status updated");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/support" className="text-slate-400 hover:text-slate-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">{ticket.title}</h1>
        <Badge variant="outline" className="text-xs">{ticket.priority}</Badge>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">Status:</span>
        <Select value={status} onValueChange={updateStatus}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["open", "in_progress", "resolved", "closed"].map((s) => (
              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-slate-400">User: {ticket.user_id.slice(0, 8)}...</span>
        <span className="text-xs text-slate-400">{format(new Date(ticket.created_at), "MMM d, HH:mm")}</span>
      </div>

      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-sm font-medium text-slate-500">Description</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-700">{ticket.description}</CardContent>
      </Card>

      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.is_admin ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-sm p-3 rounded-lg text-sm ${m.is_admin ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"}`}>
              <p>{m.message}</p>
              <p className={`text-xs mt-1 ${m.is_admin ? "text-indigo-200" : "text-slate-400"}`}>{format(new Date(m.created_at), "HH:mm")}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type admin reply..."
          rows={2}
          className="flex-1 text-sm"
        />
        <Button onClick={sendReply} disabled={sending || !reply.trim()} className="bg-indigo-600 hover:bg-indigo-700 self-end">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
