"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Handle {
  id: string;
  platform: string;
  handle: string;
}

function getDeepLink(platform: string, handle: string): string {
  const clean = handle.replace(/^@/, "").replace(/[^a-zA-Z0-9_+\-\.]/g, "");
  switch (platform.toLowerCase()) {
    case "whatsapp": return `https://wa.me/${clean.replace(/[^0-9]/g, "")}`;
    case "telegram": return `https://t.me/${clean}`;
    case "line": return `https://line.me/ti/p/${clean}`;
    case "discord": return `https://discord.com/users/${clean}`;
    case "slack": return `https://slack.com/`;
    case "messenger": return `https://m.me/${clean}`;
    case "facebook": return `https://facebook.com/${clean}`;
    case "wechat": return `weixin://dl/profile/${clean}`;
    default: return "#";
  }
}

const PLATFORM_STYLES: Record<string, string> = {
  whatsapp: "bg-green-100 text-green-800 border-green-200",
  telegram: "bg-sky-100 text-sky-800 border-sky-200",
  wechat: "bg-green-200 text-green-900 border-green-300",
  line: "bg-emerald-100 text-emerald-800 border-emerald-200",
  discord: "bg-indigo-100 text-indigo-800 border-indigo-200",
  slack: "bg-purple-100 text-purple-800 border-purple-200",
  messenger: "bg-blue-100 text-blue-800 border-blue-200",
  facebook: "bg-blue-200 text-blue-900 border-blue-300",
};

export function SocialHandles({ handles, contactPhone }: { handles: Handle[]; contactPhone?: string | null }) {
  return (
    <div className="flex flex-wrap gap-2">
      {handles.map((h) => {
        const link = getDeepLink(h.platform, h.handle);
        const style = PLATFORM_STYLES[h.platform.toLowerCase()] ?? "bg-slate-100 text-slate-700 border-slate-200";

        return (
          <a
            key={h.id}
            href={link}
            target={h.platform !== "wechat" ? "_blank" : "_self"}
            rel="noopener noreferrer"
            title={`${h.platform}: ${h.handle}`}
          >
            <Badge
              variant="outline"
              className={`flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${style}`}
            >
              <span className="capitalize">{h.platform}</span>
              <span className="opacity-70">·</span>
              <span className="max-w-[100px] truncate">{h.handle}</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-50" />
            </Badge>
          </a>
        );
      })}
    </div>
  );
}
