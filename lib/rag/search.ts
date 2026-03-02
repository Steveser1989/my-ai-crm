import { createServiceClient } from "@/lib/supabase/server";
import { embedText } from "./embed";
import type { Json } from "@/types/database";

export interface RagChunk {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export async function searchContactRag(
  contactId: string,
  query: string,
  limit = 5
): Promise<RagChunk[]> {
  const supabase = await createServiceClient();
  const embedding = await embedText(query);

  const { data, error } = await supabase.rpc("match_contact_rag", {
    query_embedding: JSON.stringify(embedding),
    match_contact_id: contactId,
    match_threshold: 0.7,
    match_count: limit,
  });

  if (error) throw error;
  return (data ?? []) as RagChunk[];
}

export async function searchProductRag(
  userId: string,
  query: string,
  limit = 5
): Promise<RagChunk[]> {
  const supabase = await createServiceClient();
  const embedding = await embedText(query);

  const { data, error } = await supabase.rpc("match_product_rag", {
    query_embedding: JSON.stringify(embedding),
    match_user_id: userId,
    match_threshold: 0.7,
    match_count: limit,
  });

  if (error) throw error;
  return (data ?? []) as RagChunk[];
}

export async function ingestContactChunk(
  contactId: string,
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = await createServiceClient();
  const embedding = await embedText(content);

  await supabase.from("contact_rag_chunks").insert({
    contact_id: contactId,
    content,
    embedding: JSON.stringify(embedding),
    metadata: metadata as unknown as Json,
  });
}

export async function ingestProductChunk(
  productId: string,
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = await createServiceClient();
  const embedding = await embedText(content);

  await supabase.from("product_rag_chunks").insert({
    product_id: productId,
    content,
    embedding: JSON.stringify(embedding),
    metadata: metadata as unknown as Json,
  });
}
