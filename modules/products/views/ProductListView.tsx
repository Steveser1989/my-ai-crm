"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  category: string | null;
  sku: string | null;
  photos: string[];
  is_active: boolean;
}

export function ProductListClient({ initialProducts }: { initialProducts: Product[] }) {
  const [search, setSearch] = useState("");

  const filtered = initialProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search products..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <Link key={product.id} href={`/dashboard/products/${product.id}`}>
            <Card className="border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-4">
                {product.photos[0] ? (
                  <img
                    src={product.photos[0]}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-3 bg-slate-100"
                  />
                ) : (
                  <div className="w-full h-40 bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="h-10 w-10 text-slate-300" />
                  </div>
                )}
                <h3 className="font-semibold text-slate-900">{product.name}</h3>
                {product.category && (
                  <Badge variant="secondary" className="text-xs mt-1">{product.category}</Badge>
                )}
                {product.description && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  {product.price ? (
                    <span className="font-bold text-slate-900">
                      {product.currency} {Number(product.price).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm">Price TBD</span>
                  )}
                  {product.sku && <span className="text-xs text-slate-400">SKU: {product.sku}</span>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
