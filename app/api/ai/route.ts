import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withCredits } from "@/lib/credits/guard";
import { searchContactRag, searchProductRag } from "@/lib/rag/search";
import openai from "@/lib/openai";

const ADVISOR_PROMPTS: Record<string, string> = {
  product: `You are an expert AI Product Knowledge Advisor for a sales CRM. You have deep knowledge of the user's product catalog and can answer customer questions about products, features, pricing, specifications, and comparisons. Always reference specific product details from the provided context. Be helpful, accurate, and professional.`,

  financial: `You are an expert AI Financial Advisor. You analyze deals, pricing negotiations, contract terms, payment structures, and financial risks. Help the sales team understand deal economics, suggest pricing strategies, identify upsell opportunities, and assess financial risks. Provide data-driven financial insights.`,

  psychology: `You are an expert AI NLP & Personal Psychology Advisor. You help sales teams understand customer psychology, communication styles, emotional intelligence, and persuasion techniques. Analyze conversation patterns, identify customer personality types, suggest tailored communication approaches, and provide coaching on building rapport and handling objections.`,

  sales: `You are an expert AI Sales Coach and Strategy Advisor. You help sales teams close deals, overcome objections, craft winning proposals, and develop relationships. Provide actionable sales tactics, pipeline strategies, negotiation tips, and deal acceleration techniques based on the customer context provided.`,

  unified: `You are a unified AI CRM Advisor combining four expertise areas: Product Knowledge, Financial Analysis, Psychology & NLP, and Sales Strategy. Analyze the customer context holistically and provide integrated advice that covers product fit, financial considerations, customer psychology, and sales strategy simultaneously.`,
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, advisor = "unified", contact_id } = await request.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  const systemPrompt = ADVISOR_PROMPTS[advisor] ?? ADVISOR_PROMPTS.unified;

  // Build RAG context
  const userQuery = messages[messages.length - 1]?.content ?? "";
  let ragContext = "";

  if (contact_id && userQuery) {
    const [contactChunks, productChunks] = await Promise.all([
      searchContactRag(contact_id, userQuery, 3).catch(() => []),
      searchProductRag(user.id, userQuery, 3).catch(() => []),
    ]);

    const contactContext = contactChunks.map((c) => c.content).join("\n\n");
    const productContext = productChunks.map((c) => c.content).join("\n\n");

    ragContext = [
      contactContext ? `## Customer Context:\n${contactContext}` : "",
      productContext ? `## Product Knowledge:\n${productContext}` : "",
    ].filter(Boolean).join("\n\n");
  }

  const fullSystem = ragContext
    ? `${systemPrompt}\n\n---\n${ragContext}`
    : systemPrompt;

  try {
    const reply = await withCredits(user.id, async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: fullSystem },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content ?? "";
      const tokensUsed = response.usage?.total_tokens ?? 0;
      return { result: content, tokensUsed, model: "gpt-4o" };
    });

    return NextResponse.json({ reply });
  } catch (err) {
    const error = err as Error;
    if (error.name === "CreditError") {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
