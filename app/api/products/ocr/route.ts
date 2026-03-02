import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractProductInfo } from "@/lib/ocr/vision";
import { withCredits } from "@/lib/credits/guard";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { imageUrl } = body;
  if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });

  try {
    const result = await withCredits(user.id, async () => {
      const { data, tokensUsed } = await extractProductInfo(imageUrl);
      return { result: data, tokensUsed, model: "gpt-4o" };
    });

    return NextResponse.json(result);
  } catch (err) {
    const error = err as Error;
    if (error.name === "CreditError") {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}
