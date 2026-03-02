"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw } from "lucide-react";

const CHANNEL_DEFAULTS: Record<string, string> = {
  whatsapp: "https://wa.me/",
  telegram: "https://t.me/",
  line: "https://line.me/ti/p/",
  discord: "https://discord.gg/",
  slack: "https://slack.com/",
  messenger: "https://m.me/",
  email: "mailto:",
  wechat: "weixin://",
};

export function QRCodeDisplay({ channel }: { channel: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState(CHANNEL_DEFAULTS[channel] ?? "https://");
  const [generated, setGenerated] = useState(false);

  async function generate() {
    if (!canvasRef.current || !url) return;
    await QRCode.toCanvas(canvasRef.current, url, { width: 160, margin: 1 });
    setGenerated(true);
  }

  useEffect(() => {
    setUrl(CHANNEL_DEFAULTS[channel] ?? "https://");
    setGenerated(false);
  }, [channel]);

  return (
    <div className="space-y-2">
      <Input
        className="text-xs h-7"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <canvas ref={canvasRef} className={`rounded-lg border border-slate-200 ${!generated ? "hidden" : ""}`} />
      {!generated && (
        <div className="h-40 w-40 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
          <QrCode className="h-8 w-8 text-slate-300" />
        </div>
      )}
      <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={generate}>
        <RefreshCw className="h-3 w-3 mr-1" />
        Generate QR
      </Button>
    </div>
  );
}
