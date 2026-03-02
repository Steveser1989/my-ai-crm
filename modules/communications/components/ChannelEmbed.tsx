"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Info, ExternalLink } from "lucide-react";
import { useState } from "react";

interface ChannelEmbedProps {
  channel: string;
  aiEnabled: boolean;
}

const CHANNEL_INFO: Record<string, { label: string; description: string; setupUrl: string; apiNote: string }> = {
  whatsapp: {
    label: "WhatsApp Business",
    description: "Connect your WhatsApp Business API to receive and send messages",
    setupUrl: "https://business.whatsapp.com/",
    apiNote: "WhatsApp Business API requires Meta Business account and webhook setup",
  },
  telegram: {
    label: "Telegram Bot",
    description: "Connect your Telegram Bot to manage customer conversations",
    setupUrl: "https://t.me/BotFather",
    apiNote: "Create a bot with @BotFather and add your bot token to .env",
  },
  line: {
    label: "LINE Messaging",
    description: "Connect your LINE Official Account for customer support",
    setupUrl: "https://developers.line.biz/",
    apiNote: "Requires LINE Developers account and channel access token",
  },
  discord: {
    label: "Discord Bot",
    description: "Manage customer interactions through your Discord server",
    setupUrl: "https://discord.com/developers/",
    apiNote: "Requires Discord Bot token and server configuration",
  },
  slack: {
    label: "Slack App",
    description: "Handle customer messages through your Slack workspace",
    setupUrl: "https://api.slack.com/apps",
    apiNote: "Requires Slack App with Bot OAuth token",
  },
  messenger: {
    label: "Facebook Messenger",
    description: "Respond to customers through Facebook Messenger",
    setupUrl: "https://developers.facebook.com/",
    apiNote: "Requires Meta Business account and Facebook App setup",
  },
  email: {
    label: "Email (Gmail)",
    description: "Manage customer emails through Gmail API integration",
    setupUrl: "https://console.cloud.google.com/",
    apiNote: "Requires Google OAuth credentials and Gmail API enabled",
  },
  wechat: {
    label: "WeChat",
    description: "WeChat handle stored — use WeChat Business for messaging",
    setupUrl: "https://work.weixin.qq.com/",
    apiNote: "WeChat embedding is not possible due to platform restrictions. Handle is stored for reference.",
  },
};

export function ChannelEmbed({ channel, aiEnabled }: ChannelEmbedProps) {
  const info = CHANNEL_INFO[channel] ?? CHANNEL_INFO.whatsapp;
  const [message, setMessage] = useState("");

  return (
    <Card className="border-slate-200 h-[500px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{info.label}</CardTitle>
          <div className="flex items-center gap-2">
            {aiEnabled && (
              <Badge className="bg-indigo-100 text-indigo-700 flex items-center gap-1">
                <Bot className="h-3 w-3" />
                AI Active
              </Badge>
            )}
            <Button variant="outline" size="sm" asChild>
              <a href={info.setupUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Setup
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        {/* API Setup Notice */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 flex-shrink-0">
          <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Integration Setup Required</p>
            <p className="text-xs text-amber-700 mt-0.5">{info.apiNote}</p>
          </div>
        </div>

        {/* Message Area (placeholder for actual integration) */}
        <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 overflow-y-auto p-3">
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
              <Bot className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 font-medium">Messages will appear here</p>
            <p className="text-xs text-slate-400">Connect your {info.label} account using the API credentials in your .env file to start seeing real-time messages</p>
          </div>
        </div>

        {/* Reply input */}
        <div className="flex gap-2 flex-shrink-0">
          <Textarea
            rows={2}
            placeholder={aiEnabled ? "AI will auto-reply — or type to override..." : `Type a message to send via ${info.label}...`}
            className="flex-1 resize-none text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button size="icon" className="bg-indigo-600 hover:bg-indigo-700 h-auto w-10 flex-shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
