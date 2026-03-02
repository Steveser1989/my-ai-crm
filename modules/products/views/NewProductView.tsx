"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine, Loader2, Camera, X, Upload } from "lucide-react";
import { toast } from "sonner";

const defaultForm = {
  name: "",
  description: "",
  price: "",
  currency: "USD",
  sku: "",
  category: "",
  specifications: "",
};

export function NewProductForm() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(defaultForm);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const { data: { user } } = await supabase.auth.getUser();
    for (const file of files) {
      const path = `products/${user?.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("products").upload(path, file, { upsert: true });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(path);
        setPhotos((prev) => [...prev, publicUrl]);
      }
    }
  }

  async function handleOCR(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrPreview(URL.createObjectURL(file));

    const { data: { user } } = await supabase.auth.getUser();
    const path = `products/${user?.id}/${Date.now()}-${file.name}`;
    await supabase.storage.from("products").upload(path, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(path);

    const res = await fetch("/api/products/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: publicUrl }),
    });

    setOcrLoading(false);

    if (res.status === 402) { toast.error("Insufficient credits"); return; }
    if (!res.ok) { toast.error("OCR failed"); return; }

    const extracted = await res.json();
    setForm({
      name: extracted.name ?? "",
      description: extracted.description ?? "",
      price: extracted.price ?? "",
      currency: "USD",
      sku: extracted.sku ?? "",
      category: extracted.category ?? "",
      specifications: extracted.specifications ?? (extracted.features ? extracted.features.join("\n") : ""),
    });
    toast.success("Product info extracted — review and save");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Product name required"); return; }
    setLoading(true);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: form.price ? parseFloat(form.price) : null,
        photos,
      }),
    });

    setLoading(false);
    if (!res.ok) { toast.error("Failed to create product"); return; }
    const product = await res.json();
    toast.success("Product created and indexed in AI!");
    router.push(`/dashboard/products/${product.id}`);
  }

  return (
    <div className="space-y-6">
      {/* OCR Scanner */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-purple-700 flex items-center gap-2">
            <ScanLine className="h-4 w-4" />
            AI OCR — Extract from Image/Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {ocrPreview && (
              <img src={ocrPreview} alt="Product" className="h-24 w-auto rounded-lg border border-purple-200 object-contain" />
            )}
            <div>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleOCR} />
              <Button type="button" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100" onClick={() => fileRef.current?.click()} disabled={ocrLoading}>
                {ocrLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Extracting...</> : <><Camera className="h-4 w-4 mr-2" />Upload & Extract</>}
              </Button>
              <p className="text-xs text-purple-500 mt-1">Upload product image or catalog page</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photos */}
            <div className="space-y-2">
              <Label>Product Photos</Label>
              <div className="flex flex-wrap gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
                    <button type="button" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                <button type="button" onClick={() => photoRef.current?.click()}
                  className="h-20 w-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center hover:border-indigo-400 transition-colors">
                  <Upload className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="pname">Product Name *</Label>
                <Input id="pname" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Wireless Bluetooth Headphones" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="99.99" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" value={form.currency} onChange={(e) => update("currency", e.target.value)} placeholder="USD" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={form.sku} onChange={(e) => update("sku", e.target.value)} placeholder="BT-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Electronics" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Detailed product description..." />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="specs">Specifications</Label>
                <Textarea id="specs" rows={3} value={form.specifications} onChange={(e) => update("specifications", e.target.value)} placeholder="Technical specs, features, dimensions..." />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save & Index in AI
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
