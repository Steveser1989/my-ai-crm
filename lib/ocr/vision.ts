import openai from "@/lib/openai";

export interface BusinessCardData {
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  whatsapp?: string;
  wechat?: string;
  linkedin?: string;
  notes?: string;
}

export interface ProductData {
  name?: string;
  description?: string;
  price?: string;
  sku?: string;
  category?: string;
  specifications?: string;
  features?: string[];
}

export async function extractBusinessCard(
  imageUrl: string
): Promise<{ data: BusinessCardData; tokensUsed: number }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract all information from this business card image and return as JSON with these fields:
name, title, company, email, phone, website, address, whatsapp, wechat, linkedin, notes.
Return only valid JSON, no markdown, no explanation.`,
          },
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "high" },
          },
        ],
      },
    ],
    max_tokens: 500,
  });

  const content = response.choices[0].message.content ?? "{}";
  const tokensUsed = response.usage?.total_tokens ?? 0;

  let data: BusinessCardData = {};
  try {
    data = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    data = {};
  }

  return { data, tokensUsed };
}

export async function extractProductInfo(
  imageUrl: string
): Promise<{ data: ProductData; tokensUsed: number }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract all product information from this image or document and return as JSON with these fields:
name, description, price, sku, category, specifications, features (array).
Return only valid JSON, no markdown, no explanation.`,
          },
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "high" },
          },
        ],
      },
    ],
    max_tokens: 800,
  });

  const content = response.choices[0].message.content ?? "{}";
  const tokensUsed = response.usage?.total_tokens ?? 0;

  let data: ProductData = {};
  try {
    data = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    data = {};
  }

  return { data, tokensUsed };
}
