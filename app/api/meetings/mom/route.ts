import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withCredits } from "@/lib/credits/guard";
import openai from "@/lib/openai";
import { ingestContactChunk } from "@/lib/rag/search";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { transcript, contact_id, meeting_id } = await request.json();
  if (!transcript) return NextResponse.json({ error: "transcript required" }, { status: 400 });

  try {
    const mom = await withCredits(user.id, async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional meeting secretary. Generate structured Minutes of Meeting (MOM) from the provided transcript.
Include: Date/Time, Attendees (if mentioned), Agenda Items, Key Discussion Points, Decisions Made, Action Items with owners and deadlines, Next Steps.
Format it clearly with headers.`,
          },
          { role: "user", content: transcript },
        ],
        max_tokens: 1500,
      });

      const momText = response.choices[0].message.content ?? "";
      const tokensUsed = response.usage?.total_tokens ?? 0;
      return { result: momText, tokensUsed, model: "gpt-4o" };
    });

    const momText = mom as string;

    // Save MOM to meeting record
    if (meeting_id) {
      await supabase
        .from("meetings")
        .update({ mom: momText, status: "completed", ended_at: new Date().toISOString() })
        .eq("id", meeting_id);
    }

    // Ingest MOM into contact RAG
    if (contact_id) {
      await ingestContactChunk(contact_id, `Meeting MOM:\n${momText}`, {
        source: "meeting_mom",
        date: new Date().toISOString(),
      }).catch(console.error);
    }

    return NextResponse.json({ mom: momText });
  } catch (err) {
    const error = err as Error;
    if (error.name === "CreditError") {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }
    return NextResponse.json({ error: "MOM generation failed" }, { status: 500 });
  }
}
