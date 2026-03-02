import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package } from "lucide-react";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!product) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/products"><ArrowLeft className="h-4 w-4 mr-1" />Products</Link>
        </Button>
        <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
        <Badge variant={product.is_active ? "default" : "secondary"} className={product.is_active ? "bg-green-100 text-green-700" : ""}>
          {product.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {product.photos.length > 0 && (
        <div className="flex gap-3 overflow-x-auto">
          {product.photos.map((url: string, i: number) => (
            <img key={i} src={url} alt={product.name} className="h-48 w-auto rounded-lg object-cover border border-slate-200 flex-shrink-0" />
          ))}
        </div>
      )}

      <Card className="border-slate-200">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.price && (
              <div>
                <p className="text-xs text-slate-500">Price</p>
                <p className="font-bold text-slate-900">{product.currency} {Number(product.price).toLocaleString()}</p>
              </div>
            )}
            {product.sku && <div><p className="text-xs text-slate-500">SKU</p><p className="font-medium text-slate-800">{product.sku}</p></div>}
            {product.category && <div><p className="text-xs text-slate-500">Category</p><p className="font-medium text-slate-800">{product.category}</p></div>}
          </div>
          {product.description && (
            <div><h3 className="text-sm font-semibold text-slate-700 mb-1">Description</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
          {product.specifications && (
            <div><h3 className="text-sm font-semibold text-slate-700 mb-1">Specifications</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{product.specifications}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
