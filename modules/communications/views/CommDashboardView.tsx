"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QRCodeDisplay } from "@/modules/communications/components/QRCodeDisplay";
import { ChannelEmbed } from "@/modules/communications/components/ChannelEmbed";
import { DailyMeetingRoom } from "@/modules/communications/components/DailyMeetingRoom";
import { TwilioCallWidget } from "@/modules/communications/components/TwilioCallWidget";
import { MessageSquare, Phone, Video, Mail, Bot } from "lucide-react";

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", color: "bg-green-500" },
  { id: "telegram", label: "Telegram", color: "bg-sky-500" },
  { id: "line", label: "LINE", color: "bg-green-600" },
  { id: "discord", label: "Discord", color: "bg-indigo-600" },
  { id: "slack", label: "Slack", color: "bg-purple-600" },
  { id: "messenger", label: "Messenger", color: "bg-blue-500" },
  { id: "email", label: "Email", color: "bg-slate-600" },
];

export function CommunicationsDashboard() {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [activeChannel, setActiveChannel] = useState("whatsapp");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Communications</h1>
          <p className="text-slate-500 text-sm mt-1">All your messaging channels in one place</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2">
          <Bot className="h-4 w-4 text-indigo-600" />
          <Label htmlFor="ai-toggle" className="text-sm font-medium text-slate-700">AI Auto-Reply</Label>
          <Switch id="ai-toggle" checked={aiEnabled} onCheckedChange={setAiEnabled} />
          <Badge variant={aiEnabled ? "default" : "secondary"} className={aiEnabled ? "bg-green-100 text-green-700" : ""}>
            {aiEnabled ? "ON" : "OFF"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="messaging">
        <TabsList className="bg-slate-100 mb-4">
          <TabsTrigger value="messaging" className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            Messaging
          </TabsTrigger>
          <TabsTrigger value="meeting" className="flex items-center gap-1">
            <Video className="h-3.5 w-3.5" />
            Video Meeting
          </TabsTrigger>
          <TabsTrigger value="call" className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            Phone Call
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messaging">
          <div className="grid grid-cols-4 gap-4">
            {/* Channel selector */}
            <div className="col-span-1 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Channels</p>
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeChannel === ch.id
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${ch.color}`} />
                  {ch.label}
                </button>
              ))}

              {/* QR Code Section */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">QR Code</p>
                <QRCodeDisplay channel={activeChannel} />
              </div>
            </div>

            {/* Channel embed */}
            <div className="col-span-3">
              <ChannelEmbed channel={activeChannel} aiEnabled={aiEnabled} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="meeting">
          <DailyMeetingRoom />
        </TabsContent>

        <TabsContent value="call">
          <TwilioCallWidget />
        </TabsContent>
      </Tabs>
    </div>
  );
}
