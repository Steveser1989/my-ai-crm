"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bot, Package, DollarSign, Brain, TrendingUp, Users,
  Send, Loader2, ChevronDown, Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  company: string | null;
  title: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ADVISORS = [
  { id: "unified", label: "Unified AI", icon: Sparkles, color: "bg-gradient-to-br from-indigo-500 to-purple-500", description: "All advisors combined" },
  { id: "product", label: "Product Knowledge", icon: Package, color: "bg-green-500", description: "Product features & specs" },
  { id: "financial", label: "Financial Advisor", icon: DollarSign, color: "bg-blue-500", description: "Deal economics & pricing" },
  { id: "psychology", label: "NLP & Psychology", icon: Brain, color: "bg-purple-500", description: "Customer psychology & NLP" },
  { id: "sales", label: "Sales Coach", icon: TrendingUp, color: "bg-orange-500", description: "Sales tactics & strategy" },
];

export function AIAdvisorDashboard({ contacts }: { contacts: Contact[] }) {
  const [selectedAdvisor, setSelectedAdvisor] = useState("unified");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.company?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: newMessages,
        advisor: selectedAdvisor,
        contact_id: selectedContact?.id ?? null,
      }),
    });

    setLoading(false);

    if (res.status === 402) {
      toast.error("Insufficient credits. Please top up.");
      return;
    }
    if (!res.ok) { toast.error("AI request failed"); return; }

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
  }

  const activeAdvisor = ADVISORS.find((a) => a.id === selectedAdvisor)!;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left panel — Advisor + Contact selector */}
      <div className="w-72 flex flex-col gap-4 flex-shrink-0">
        {/* Advisor selection */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Choose Advisor</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {ADVISORS.map((advisor) => (
              <button
                key={advisor.id}
                onClick={() => { setSelectedAdvisor(advisor.id); setMessages([]); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedAdvisor === advisor.id
                    ? "bg-indigo-50 border border-indigo-200"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className={`h-7 w-7 rounded-lg ${advisor.color} flex items-center justify-center flex-shrink-0`}>
                  <advisor.icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-800 text-xs">{advisor.label}</p>
                  <p className="text-slate-400 text-xs">{advisor.description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Contact context */}
        <Card className="border-slate-200 flex-1 overflow-hidden flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Customer Context
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 flex flex-col gap-2 overflow-hidden flex-1">
            <input
              className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              placeholder="Search contacts..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
            />
            {selectedContact && (
              <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-200">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-indigo-200 text-indigo-700">
                      {selectedContact.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold text-indigo-800">{selectedContact.name}</p>
                    {selectedContact.company && <p className="text-xs text-indigo-600">{selectedContact.company}</p>}
                  </div>
                </div>
                <button onClick={() => setSelectedContact(null)} className="text-xs text-indigo-500 hover:text-indigo-700 mt-1">
                  Remove context
                </button>
              </div>
            )}
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                      selectedContact?.id === contact.id ? "bg-indigo-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-slate-200">
                        {contact.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{contact.name}</p>
                      {contact.company && <p className="text-xs text-slate-400 truncate">{contact.company}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right panel — Chat */}
      <Card className="flex-1 border-slate-200 flex flex-col overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg ${activeAdvisor.color} flex items-center justify-center`}>
              <activeAdvisor.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">{activeAdvisor.label}</CardTitle>
              {selectedContact && (
                <p className="text-xs text-slate-400">
                  Context: {selectedContact.name}{selectedContact.company ? ` · ${selectedContact.company}` : ""}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="ml-auto text-xs">GPT-4o</Badge>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className={`h-16 w-16 rounded-2xl ${activeAdvisor.color} flex items-center justify-center`}>
                <activeAdvisor.icon className="h-8 w-8 text-white" />
              </div>
              <p className="font-semibold text-slate-700">{activeAdvisor.label}</p>
              <p className="text-sm text-slate-400 max-w-xs">{activeAdvisor.description}</p>
              {selectedContact && (
                <Badge className="bg-indigo-100 text-indigo-700">
                  Ready to analyze {selectedContact.name}
                </Badge>
              )}
              <div className="grid grid-cols-2 gap-2 mt-2 max-w-sm">
                {[
                  "What's the best strategy for this customer?",
                  "How should I handle objections?",
                  "What products would suit this customer?",
                  "Analyze the deal economics",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-xs text-left bg-slate-50 border border-slate-200 rounded-lg p-2 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className={`h-7 w-7 rounded-lg ${activeAdvisor.color} flex items-center justify-center flex-shrink-0 mt-1`}>
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-slate-100 text-slate-800 rounded-tl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className={`h-7 w-7 rounded-lg ${activeAdvisor.color} flex items-center justify-center flex-shrink-0`}>
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex gap-2">
            <Textarea
              rows={2}
              placeholder={`Ask ${activeAdvisor.label} about ${selectedContact ? selectedContact.name : "your customers"}...`}
              className="flex-1 resize-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 h-auto w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </Card>
    </div>
  );
}
