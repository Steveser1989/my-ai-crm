import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingestProductChunk } from "@/lib/rag/search";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  let query = supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const { data: product, error } = await supabase
    .from("products")
    .insert({ ...body, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Ingest product info into RAG
  const ragContent = [
    `Product: ${product.name}`,
    product.description ? `Description: ${product.description}` : "",
    product.price ? `Price: ${product.currency} ${product.price}` : "",
    product.sku ? `SKU: ${product.sku}` : "",
    product.category ? `Category: ${product.category}` : "",
    product.specifications ? `Specifications: ${product.specifications}` : "",
  ].filter(Boolean).join("\n");

  await ingestProductChunk(product.id, ragContent, { source: "product_profile" }).catch(console.error);

  return NextResponse.json(product, { status: 201 });
}
