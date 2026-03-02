"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, Plus, X, ScanLine } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = ["whatsapp", "wechat", "telegram", "line", "facebook", "discord", "slack", "messenger"];

interface SocialHandle {
  platform: string;
  handle: string;
}

const defaultForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  title: "",
  address: "",
  website: "",
  notes: "",
};

export function NewContactForm() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(defaultForm);
  const [socialHandles, setSocialHandles] = useState<SocialHandle[]>([]);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addSocialHandle() {
    setSocialHandles((prev) => [...prev, { platform: "whatsapp", handle: "" }]);
  }

  function updateHandle(idx: number, field: "platform" | "handle", val: string) {
    setSocialHandles((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: val } : h));
  }

  function removeHandle(idx: number) {
    setSocialHandles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleOCR(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrPreview(URL.createObjectURL(file));

    // Upload to Supabase Storage first
    const { data: { user } } = await supabase.auth.getUser();
    const path = `business-cards/${user?.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("contacts")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setOcrLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("contacts").getPublicUrl(path);

    const res = await fetch("/api/contacts/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: publicUrl }),
    });

    setOcrLoading(false);

    if (res.status === 402) {
      toast.error("Insufficient credits. Please top up.");
      return;
    }
    if (!res.ok) { toast.error("OCR extraction failed"); return; }

    const extracted = await res.json();
    setForm({
      name: extracted.name ?? "",
      email: extracted.email ?? "",
      phone: extracted.phone ?? "",
      company: extracted.company ?? "",
      title: extracted.title ?? "",
      address: extracted.address ?? "",
      website: extracted.website ?? "",
      notes: "",
    });

    // Add social handles from card
    const handles: SocialHandle[] = [];
    if (extracted.whatsapp) handles.push({ platform: "whatsapp", handle: extracted.whatsapp });
    if (extracted.wechat) handles.push({ platform: "wechat", handle: extracted.wechat });
    if (extracted.linkedin) handles.push({ platform: "linkedin", handle: extracted.linkedin });
    setSocialHandles(handles);

    toast.success("Business card extracted — review and save");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setLoading(true);

    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        social_handles: socialHandles.filter((h) => h.handle.trim()),
      }),
    });

    setLoading(false);
    if (!res.ok) { toast.error("Failed to create contact"); return; }
    const contact = await res.json();
    toast.success("Contact created!");
    router.push(`/dashboard/contacts/${contact.id}`);
  }

  return (
    <div className="space-y-6">
      {/* OCR Business Card Scanner */}
      <Card className="border-indigo-200 bg-indigo-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
            <ScanLine className="h-4 w-4" />
            Scan Business Card (OCR)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {ocrPreview && (
              <img src={ocrPreview} alt="Business card" className="h-24 w-auto rounded-lg border border-indigo-200 object-contain" />
            )}
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleOCR} />
              <Button
                type="button"
                variant="outline"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                onClick={() => fileRef.current?.click()}
                disabled={ocrLoading}
              >
                {ocrLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Extracting...</>
                ) : (
                  <><Camera className="h-4 w-4 mr-2" />Upload Business Card</>
                )}
              </Button>
              <p className="text-xs text-indigo-500 mt-1">AI will auto-fill the form below</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Jane Smith" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={form.company} onChange={(e) => updateForm("company", e.target.value)} placeholder="Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder="Sales Manager" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="jane@acme.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="+1 555 000 0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={form.website} onChange={(e) => updateForm("website", e.target.value)} placeholder="https://acme.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => updateForm("address", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} placeholder="Any additional notes..." />
            </div>

            <Separator />

            {/* Social Handles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Messaging Handles</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSocialHandle}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {socialHandles.map((handle, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={handle.platform}
                    onChange={(e) => updateHandle(idx, "platform", e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                  <Input
                    className="flex-1"
                    placeholder="Username or phone number"
                    value={handle.handle}
                    onChange={(e) => updateHandle(idx, "handle", e.target.value)}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeHandle(idx)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Contact
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
