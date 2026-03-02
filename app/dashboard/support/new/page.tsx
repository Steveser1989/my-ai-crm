"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const CATEGORIES = ["bug", "billing", "feature", "other"];

export default function NewTicketPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("bug");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const path = `support/${user?.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("support").upload(path, file, { upsert: true });
    setUploading(false);
    if (error) { toast.error("Upload failed"); return; }
    const { data: { publicUrl } } = supabase.storage.from("support").getPublicUrl(path);
    setScreenshotUrl(publicUrl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { toast.error("Title and description required"); return; }
    setLoading(true);
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, screenshot_url: screenshotUrl }),
    });
    setLoading(false);
    if (!res.ok) { toast.error("Failed to submit ticket"); return; }
    toast.success("Ticket submitted! We'll respond soon.");
    router.push("/dashboard/support");
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/support"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Submit Ticket</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-base">Ticket Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      category === cat ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief description of the issue" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail, including steps to reproduce..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Screenshot (optional)</Label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
              {screenshotUrl ? (
                <div className="relative inline-block">
                  <img src={screenshotUrl} alt="Screenshot" className="h-32 rounded-lg border border-slate-200 object-cover" />
                  <button type="button" onClick={() => setScreenshotUrl(null)} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Screenshot
                </Button>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Ticket
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
