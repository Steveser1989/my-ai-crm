import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductListClient } from "@/modules/products/views/ProductListView";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-1">{products?.length ?? 0} products in your catalog</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>
      <ProductListClient initialProducts={products ?? []} />
    </div>
  );
}
