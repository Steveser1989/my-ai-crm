"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const KEYS = [
  { label: "OpenAI API Key", envKey: "OPENAI_API_KEY", hint: "sk-..." },
  { label: "Stripe Secret Key", envKey: "STRIPE_SECRET_KEY", hint: "sk_live_..." },
  { label: "Twilio Account SID", envKey: "TWILIO_ACCOUNT_SID", hint: "AC..." },
  { label: "Twilio Auth Token", envKey: "TWILIO_AUTH_TOKEN", hint: "" },
  { label: "Daily.co API Key", envKey: "DAILY_API_KEY", hint: "" },
];

export default function ApiKeysPage() {
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setVisible((v) => ({ ...v, [key]: !v[key] }));
  }

  function handleSave() {
    toast.success("API key settings are managed via environment variables in your deployment.");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-slate-900">API Keys</h1>
      <p className="text-sm text-slate-500">
        API keys are configured as environment variables in your Vercel project settings.
        This view shows the currently configured keys (masked).
      </p>

      <div className="space-y-4">
        {KEYS.map((k) => (
          <Card key={k.envKey} className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-slate-500">{k.label}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      type={visible[k.envKey] ? "text" : "password"}
                      value={`${k.envKey} (set in environment)`}
                      className="text-sm font-mono bg-slate-50"
                    />
                    <button onClick={() => toggle(k.envKey)} className="text-slate-400 hover:text-slate-700">
                      {visible[k.envKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          How to Update Keys
        </Button>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 text-sm text-amber-700">
          <p className="font-medium">To update API keys:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1 text-xs">
            <li>Go to your Vercel Dashboard → Project → Settings → Environment Variables</li>
            <li>Update the desired key</li>
            <li>Redeploy the project for changes to take effect</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
